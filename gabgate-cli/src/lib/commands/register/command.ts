import { CommanderStatic } from 'commander';

import { registerAction } from './action';

export const register = (program: CommanderStatic) => {
	program
		.command('register')
		.description('Register new user')
		.action(registerAction);
};
