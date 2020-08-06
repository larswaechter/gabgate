import { CommanderStatic } from 'commander';

import { loginAction } from './action';

export const login = (program: CommanderStatic) => {
	program
		.command('login')
		.description('Login existing user')
		.action(loginAction);
};
