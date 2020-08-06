import clear from 'clear';

import { env } from '../../config/global';

import { Chat } from '../../modules/chat';
import { Printer } from '../../modules/printer';
import { Websocket } from '../../modules/websocket';

import { SessionService } from '../../services/session';

export const joinAction = (roomHash: string) => {
	try {
		SessionService.exitOnUnauth();

		const printer: Printer = new Printer();

		// Connect to websocket
		const websocket: Websocket = new Websocket(env.ws as string, SessionService.user.username, printer);

		websocket.socket.on('connect', () => {
			websocket.emit('join-room', roomHash);

			websocket.on('joined-room', () => {
				clear();
				Printer.printInfo(`Joined room ${roomHash}!`);

				// Start chat
				new Chat(printer, websocket).waitForInput();
			});
		});
	} catch (err) {
		Printer.printError(err);
	}
};
