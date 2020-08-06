import clear from 'clear';
import { bind } from 'decko';
import { existsSync } from 'fs';
import { clearLine, cursorTo } from 'readline';

import { File } from './file';
import { Printer } from './printer';
import { Websocket } from './websocket';

import { SessionService } from '../services/session';

export class Chat {
	/**
	 * Read chat input messages
	 */
	public static readInput = true;

	/**
	 * Printer for chat messages
	 */
	private printer: Printer;

	/**
	 * Websocket chat is listen on
	 */
	private websocket: Websocket;

	/**
	 *
	 * @param printer Printer for chat
	 * @param websocket  Websocket to listen on
	 */
	constructor(printer: Printer, websocket: Websocket) {
		this.printer = printer;
		this.websocket = websocket;
		this.printer.on('created-interface', this.waitForInput);
	}

	/**
	 * Wait for chat input from user
	 */
	@bind
	public waitForInput(): void {
		// Clear line and reset cursor
		clearLine(process.stdout, 0);
		cursorTo(process.stdout, 0);

		this.printer.setPrompt();

		this.printer.rl.on('line', line => {
			if (Chat.readInput) {
				if (line[0] === '/') {
					const options: string[] = line.split(' ');
					const command: string = options[0].substr(1);
					options.shift();

					this.handleCommand(command, options);
				} else if (line.length) {
					this.websocket.emit('chat-input', line);
				}

				this.printer.rl.prompt(true);
			}
		});
	}

	/**
	 * Handle file command for file sending
	 *
	 * @param filepath Path to file to send
	 */
	private handleFileCommand(filepath: string): void {
		// Check if file exists
		if (existsSync(filepath)) {
			const file: File = File.createFromPath(filepath);

			// Allow max filesize of 10 MB
			if (!file.hasValidSize()) {
				Printer.printError(new Error('Invalid file size! Max 10MB allowed.'));
				// Allow only certain file types
			} else if (!file.hasValidType()) {
				Printer.printError(new Error(`Invalid file type! Allowed file types: ${File.allowedFileTypes.join(', ')}`));
			} else {
				// Send file
				this.websocket.emit('chat-input-file', file);
				Printer.printInfo('File sent.');
			}
		} else {
			Printer.printError(new Error('File not found!'));
		}
	}

	/**
	 * Handle chat command
	 *
	 * @param command Chat command
	 */
	private handleCommand(command: string, options?: string[]): void {
		switch (command) {
			case 'clear':
				clear();
				this.printer.setPrompt();
				break;
			case 'leave':
				this.websocket.emit('leave-room');
				this.websocket.socket.disconnect();
				break;

			case 'room':
				this.websocket.emit('room-details', this.websocket.roomHash);
				break;

			case 'mute':
				SessionService.config.notification = 'false';
				Printer.printInfo('Muted chat temporarily');
				break;

			case 'unmute':
				SessionService.config.notification = 'true';
				Printer.printInfo('Unmuted chat temporarily');
				break;

			case 'file':
				if (options && !options.length) {
					Printer.printError(new Error('No file path provided!'));
				} else if (options && options[0]) {
					this.handleFileCommand(options[0]);
				}
				break;
			default:
				Printer.printError(new Error('Command not found!'));
				break;
		}
	}
}
