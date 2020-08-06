import { EventEmitter } from 'events';
import { clearLine, createInterface, cursorTo, Interface } from 'readline';

import chalk from 'chalk';

import { SessionService } from '../services/session';
import { UtilityService } from '../services/utility';

type MessageTypes = 'message' | 'error' | 'info';

export class Printer extends EventEmitter {
	/**
	 * Print error to terminal
	 *
	 * @param error Error object
	 */
	public static printError(error: Error) {
		console.log(chalk.red('Error') + `: ${error.message}`);
	}

	/**
	 * Print info to terminal
	 *
	 * @param title Message title
	 * @param msg Message
	 */
	public static printInfo(msg: string) {
		console.log(chalk.green.italic('Info') + `: ${msg}`);
	}

	/**
	 * Print info to chat
	 *
	 * @param username Message author
	 * @param msg Message
	 */
	public static printChatError(username: string, msg: string): void {
		console.log(UtilityService.getDateTime() + chalk.red.bold(` <${username}> `) + chalk.italic(msg));
	}

	/**
	 * Print info to chat
	 *
	 * @param username Message author
	 * @param msg Message
	 */
	public static printChatInfo(username: string, msg: string): void {
		console.log(UtilityService.getDateTime() + chalk.green.bold(` <${username}> `) + chalk.italic(msg));
	}

	/**
	 * Print message to chat
	 *
	 * @param username Message author
	 * @param msg Message
	 */
	public static printChatMessage(username: string, msg: string): void {
		console.log(UtilityService.getDateTime() + chalk.cyan.bold(` <${username}> `) + msg);
	}

	/**
	 * Interface to read from terminal
	 */
	private _rl = createInterface(process.stdin, process.stdout);

	/**
	 * Returns rl interface
	 *
	 * @returns Interface
	 */
	public get rl(): Interface {
		return this._rl;
	}

	public recreateInterface(): void {
		this._rl.close();
		this._rl = createInterface(process.stdin, process.stdout);
		this.emit('created-interface');
	}

	/**
	 * Set terminal prompt
	 */
	public setPrompt(): void {
		this.rl.setPrompt(`${SessionService.user.username}> `);
		this.rl.prompt(true);
	}

	/**
	 * Print message to terminal chat based on type
	 *
	 * @param username Author of message
	 * @param msg Message to print
	 * @param type Type of message
	 * @param setPrompt Set terminal prompt
	 */
	public printMessage(username: string, msg: string, type: MessageTypes = 'message', setPrompt: boolean = true): void {
		clearLine(process.stdout, 0);
		cursorTo(process.stdout, 0);

		this.rl.setPrompt('> ');
		this.rl.prompt(true);

		switch (type) {
			case 'error':
				Printer.printChatError(username, msg);
				break;
			case 'info':
				Printer.printChatInfo(username, msg);
				break;
			default:
				Printer.printChatMessage(username, msg);
				break;
		}

		if (setPrompt) {
			this.setPrompt();
		}
	}
}
