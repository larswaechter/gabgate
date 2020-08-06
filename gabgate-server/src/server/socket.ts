import { Server } from 'http';
import { authorize } from 'socketio-jwt';

import io from 'socket.io';
import redisIO from 'socket.io-redis';

import { RedisService } from '../services/redis';

import { logger } from '../config/logger';
import { env } from '../config/global';

export interface IFile {
	_buffer: Buffer;
	_name: string;
	_size: number;
	_type: string;
}

export class SocketServer {
	/**
	 * SocketIO server
	 */
	private server: io.Server;

	/**
	 * Username for server in chat
	 */
	private serverUsername: string;

	/**
	 * Allowed file types to send
	 */
	private allowedFileTypes: string[] = ['.jpg', '.jpeg', '.png', '.mp3', '.wav'];

	/**
	 * @param serverUsername Username for server in chat
	 */
	constructor(serverUsername: string = 'Gabgate') {
		this.serverUsername = serverUsername;
	}

	/**
	 * Start socket server and register middleware and events
	 *
	 * @param server HTTP Server
	 */
	public startSever(server: Server) {
		this.server = io(server);

		this.server.adapter(
			redisIO({
				host: process.env.REDIS_HOST || 'localhost',
				auth_pass: process.env.REDIS_PASS || '',
				port: 6379
			})
		);

		// Always register middleware at first
		this.registerMiddleware();
		this.registerEvents();
	}

	/**
	 * Register websocket middleware
	 */
	private registerMiddleware(): void {
		// JWT authentication
		this.server.use(
			authorize({
				decodedPropertyName: 'whatisthisfor',
				handshake: true,
				secret: env.jwtSecret
			})
		);

		// Validate client and username
		this.server.use(async (socket: io.Socket, cb) => {
			const username: string = socket.request._query.username;
			const client: string = socket.request._query.client;

			if (
				env.name === 'production' &&
				(client !== 'gabgate-cli' || !username || (await RedisService.hasConnectedUser(username)) > 0)
			) {
				return socket.disconnect();
			}

			return cb();
		});
	}

	/**
	 * Combine username with chat message
	 *
	 * @param message Message to print
	 * @param username Message author
	 */
	private formatChatMessage(message: string, username: string = this.serverUsername) {
		return `<${username}> ${message}`;
	}

	/**
	 * Register websocket events
	 */
	private registerEvents(): void {
		/**
		 * User connected to server
		 */
		this.server.on('connection', (socket: io.Socket) => {
			const username: string = socket.request._query.username;

			// Store in Redis
			RedisService.addConnectedUser(username);

			logger.info({
				isConnection: true,
				level: 'info',
				message: `${username} connected!`
			});

			/**
			 * User disconnected from server
			 */
			socket.on('disconnect', () => {
				// Remove from Redis
				RedisService.removeConnectedUser(username);
				logger.info({
					isConnection: true,
					level: 'info',
					message: `${username} disconnected!`
				});
			});

			/**
			 * Create new room and leave old ones
			 */
			socket.on('create-room', (room: string) => {
				socket.leaveAll();
				socket.join(room).emit('created-room');
			});

			/**
			 * Join new room
			 */
			socket.on('join-room', (roomHash: string) => {
				if (roomHash && this.server.sockets.adapter.rooms[roomHash]) {
					socket.leaveAll();
					socket.join(roomHash).emit('joined-room');

					const raw: string = `${username} joined this room!`;

					socket.broadcast.to(roomHash).emit('chat-info', {
						msg: {
							formatted: this.formatChatMessage(raw),
							raw
						},
						username: this.serverUsername
					});
				} else {
					socket.emit('server-error', `Room ${roomHash} not found!`);
				}
			});

			/**
			 * Leave room
			 */
			socket.on('leave-room', () => {
				// Sine a user can be only in one room, always leave the first one from array
				const roomHash: string = socket.rooms[Object.keys(socket.rooms)[0]];
				socket.leave(roomHash);

				const raw: string = `${username} left this room!`;

				socket.broadcast.to(roomHash).emit('chat-info', {
					msg: {
						formatted: this.formatChatMessage(raw),
						raw
					},
					username: this.serverUsername
				});
			});

			/**
			 * Get room details
			 */
			socket.on('room-details', (room: string) => {
				const roomDetails: io.Room = this.server.sockets.adapter.rooms[room];
				const raw: string = `Room {id: ${room}, members: ${roomDetails.length}}`;

				this.server.to(room).emit('chat-msg', {
					msg: {
						formatted: this.formatChatMessage(raw),
						raw
					},
					username: this.serverUsername
				});
			});

			/**
			 * New incoming chat message
			 */
			socket.on('chat-input', (msg: string) => {
				const room: string = socket.rooms[Object.keys(socket.rooms)[0]];

				socket.broadcast.to(room).emit('chat-msg', {
					msg: {
						formatted: `<${username}> ${msg}`,
						raw: msg
					},
					username
				});
			});

			/**
			 * New incoming chat message
			 */
			socket.on('chat-input-file', (file: IFile) => {
				const room: string = socket.rooms[Object.keys(socket.rooms)[0]];

				if (file._size > 10000000) {
					const raw: string = 'File too large! Max 10MB allowed.';
					socket.emit('chat-error', {
						msg: {
							formatted: this.formatChatMessage(raw),
							raw
						},
						username: this.serverUsername
					});
				} else if (!this.allowedFileTypes.includes(file._type)) {
					const raw = `Invalid file type. Allowed file types: ${this.allowedFileTypes.join(', ')}`;
					socket.emit('chat-error', {
						msg: {
							formatted: this.formatChatMessage(raw),
							raw
						},
						username: this.serverUsername
					});
				} else {
					socket.broadcast.to(room).emit('chat-msg-file', {
						msg: file,
						username
					});
				}
			});
		});
	}
}
