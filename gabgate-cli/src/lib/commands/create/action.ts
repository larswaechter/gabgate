import clear from 'clear';
import { writeSync } from 'clipboardy';
import { v4 } from 'uuid';

import { env } from '../../config/global';

import { Chat } from '../../modules/chat';
import { Printer } from '../../modules/printer';
import { Websocket } from '../../modules/websocket';

import { SessionService } from '../../services/session';

export const createAction = () => {
	try {
		SessionService.exitOnUnauth();

		// Hash for room identification
		const roomHash: string = v4();

		const printer: Printer = new Printer();

		// Connect to websocket
		const websocket: Websocket = new Websocket(env.ws as string, SessionService.user.username, printer);

		websocket.socket.on('connect', () => {
			websocket.emit('create-room', roomHash);

			websocket.on('created-room', () => {
				/**
				 * Copy hash to clipboard
				 * TODO: Does not work for WSL
				 */
				writeSync(roomHash);

				clear();
				Printer.printInfo(`Created room! Your room id is: ${roomHash}`);

				// Start chat
				new Chat(printer, websocket).waitForInput();
			});
		});
	} catch (err) {
		Printer.printError(err);
	}
};
