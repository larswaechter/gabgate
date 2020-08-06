import clear from 'clear';
import { CommanderStatic } from 'commander';
import { textSync } from 'figlet';

import { Printer } from '../modules/printer';

import { config } from './config/command';
import { create } from './create/command';
import { friends } from './friends/command';
import { join } from './join/command';
import { login } from './login/command';
import { register } from './register/command';
import { user } from './user/command';

export class CommandLoader {
	/**
	 * Load CLI
	 *
	 * @param program Commander programm
	 */
	public static load(program: CommanderStatic) {
		// Register commands
		config(program);
		create(program);
		friends(program);
		join(program);
		login(program);
		register(program);
		user(program);

		this.description(program);
		this.invalid(program);

		// Check if no argument was passed
		if (process.argv.length === 2) {
			clear();
			console.log(textSync('Gabgate') + '\n');
			program.outputHelp();
			return process.exit(0);
		}
	}

	/**
	 * Set CLI version and description
	 *
	 * @param program Commander program
	 */
	private static description(program: CommanderStatic): void {
		program
			.version(require('../../../package.json').version)
			.description('A Node.js based realtime chat application for the terminal.');
	}

	/**
	 * Catch invalid commands
	 *
	 * @param program Commander program
	 */
	private static invalid(program: CommanderStatic): void {
		program.on('command:*', () => {
			Printer.printError(new Error('Invalid command: %s\nSee --help for a list of available commands.'));
			process.exit(0);
		});
	}
}
