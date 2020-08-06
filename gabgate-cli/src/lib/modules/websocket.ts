import { EventEmitter } from 'events';
import { prompt, Question } from 'inquirer';
import { notify } from 'node-notifier';
import { connect } from 'socket.io-client';

import { Chat } from './chat';
import { File, IFile } from './file';
import { Printer } from './printer';

import { SessionService } from '../services/session';
import { UtilityService } from '../services/utility';

interface IChatMsgText {
	formatted: string;
	raw: string;
}

interface IChatMsg {
	msg: IChatMsgText | IFile;
	username: string;
}

export class Websocket extends EventEmitter {
	/**
	 * Socket connection client
	 */
	private _socket: SocketIOClient.Socket;

	/**
	 * Hash for room identification
	 */
	private _roomHash: string = '';

	/**
	 * Printer for chat messages
	 */
	private _printer: Printer;

	/**
	 * Creates new Socket instance
	 *
	 * @param url Websocket server URL
	 * @param username Username of chat user
	 * @param printer Printer for chat
	 * @returns New Websocket instance
	 */
	public constructor(url: string, username: string, printer: Printer) {
		super();
		this._socket = connect(url, {
			query: {
				token: SessionService.user.token,
				username,
				client: 'gabgate-cli'
			}
		});

		this._printer = printer;

		// Register events
		this.registerClientEvents();
		this.registerServerEvents();
	}

	/**
	 * Return socket connection
	 *
	 * @returns Socket connection
	 */
	public get socket(): SocketIOClient.Socket {
		return this._socket;
	}

	/**
	 * Return hash for current room
	 *
	 * @returns Room hash
	 */
	public get roomHash(): string {
		return this._roomHash;
	}

	/**
	 * Return printer for text messages
	 *
	 * @returns printer
	 */
	public get printer(): Printer {
		return this._printer;
	}

	/**
	 * Disconnect from socket connection
	 */
	public disconnect(): void {
		this.socket.disconnect();
	}

	private handleWebsocketError(err: Error): void {
		let error: Error;

		switch (err.message) {
			case 'jwt expired':
				error = UtilityService.processError(undefined, 401);
				break;
			default:
				error = UtilityService.processError(new Error('Cannot connect to Websocket!'));
				break;
		}

		Printer.printError(error);
	}

	/**
	 * WS events emitted from client to server
	 */
	private registerClientEvents(): void {
		// Create new room
		this.on('create-room', hash => {
			this._roomHash = hash;
			this.socket.emit('create-room', hash);
		});

		// Join new room
		this.on('join-room', hash => {
			this._roomHash = hash;
			this.socket.emit('join-room', hash);
		});

		// Leave current room
		this.on('leave-room', () => {
			this.socket.emit('leave-room');
		});

		// Get current room details
		this.on('room-details', roomHash => {
			this.socket.emit('room-details', roomHash);
		});

		// Send chat message
		this.on('chat-input', msg => {
			this.socket.emit('chat-input', msg);
		});

		// Send chat file
		this.on('chat-input-file', (file: File) => {
			this.socket.emit('chat-input-file', file);
		});
	}

	/**
	 * WS Events emitted from server to client
	 */
	private registerServerEvents(): void {
		// Unauthorized
		this.socket.on('unauthorized', (err: any) => {
			if (err.data.type === 'UnauthorizedError' || err.data.code === 'invalid_token') {
				this.handleWebsocketError(new Error('jwt expired'));
			} else {
				this.handleWebsocketError(new Error(''));
			}
		});

		// Disconnect
		this.socket.on('disconnect', () => {
			Printer.printInfo('Disconnected from room!');
			process.exit(0);
		});

		// Connect error
		this.socket.on('error', (err: Error) => {
			this.handleWebsocketError(err);
			process.exit(0);
		});

		// Server error
		this.socket.on('server-error', (msg: string) => {
			Printer.printError(new Error(msg));
			this.socket.close();
		});

		// New room created
		this.socket.on('created-room', () => {
			this.emit('created-room');
		});

		// New room joined
		this.socket.on('joined-room', () => {
			this.emit('joined-room');
		});

		// New incoming chat error
		this.socket.on('chat-error', (data: IChatMsg) => {
			const { username, msg } = data;
			const { raw } = msg as IChatMsgText;

			this.printer.printMessage(username, raw, 'error');
		});

		// New incoming chat info
		this.socket.on('chat-info', (data: IChatMsg) => {
			const { username, msg } = data;
			const { raw } = msg as IChatMsgText;

			this.printer.printMessage(username, raw, 'info');
		});

		// New incoming chat message
		this.socket.on('chat-msg', (data: IChatMsg) => {
			const { username, msg } = data;
			const { raw } = msg as IChatMsgText;

			this.printer.printMessage(username, raw);

			if (SessionService.config.notification === 'true') {
				notify(
					{
						message: raw,
						sound: false,
						timeout: 3,
						title: username
					},
					err => {
						if (err) {
							Printer.printError(err);
						}
					}
				);
			}
		});

		// New incoming chat file
		this.socket.on('chat-msg-file', async (data: IChatMsg) => {
			try {
				const { username, msg } = data;
				const { _buffer, _name, _size, _type } = msg as IFile;

				const file: File = new File(_buffer, _name, _size, _type);

				this.printer.printMessage(
					username,
					`Receiving file ${file.name}${file.type} (${file.size} Bytes)`,
					'message',
					false
				);

				if (SessionService.config.notification === 'true') {
					notify(
						{
							message: `Sending file`,
							sound: false,
							timeout: 3,
							title: username
						},
						err => {
							if (err) {
								Printer.printError(err);
							}
						}
					);
				}

				if (!file.isValid()) {
					Printer.printError(new Error('Illegal file received, file discarded.'));
				} else {
					// Pause chat input reading
					Chat.readInput = false;

					// Ask for permission to save file
					const question: Question = {
						default: false,
						message: 'Save file?',
						name: 'save',
						type: 'confirm'
					};

					const answer = await prompt([question]);

					// Save file
					if (answer.save) {
						await file.save();
						Printer.printInfo(`Saved file to ${file.path}`);
					} else {
						Printer.printInfo('File not saved.');
					}

					// Resume chat input reading
					Chat.readInput = true;

					// Recreate prompt interface since we started a new one with inquirer
					this._printer.recreateInterface();
				}
			} catch (err) {
				Printer.printError(err);
			}
		});
	}
}
