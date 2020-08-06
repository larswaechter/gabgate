import { CommanderStatic } from 'commander';

import { userAction } from './action';

export const user = (program: CommanderStatic) => {
	program
		.command('user')
		.description('Get information about logged in user')
		.action(userAction);
};
