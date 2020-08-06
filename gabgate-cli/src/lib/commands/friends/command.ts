import { CommanderStatic } from 'commander';

import { friendsAction } from './action';

export const friends = (program: CommanderStatic) => {
	program
		.command('friends [username]')
		.option('-a, --add', 'Add')
		.option('-r, --remove', 'Remove')
		.description('Add or remove a friend')
		.action(friendsAction);
};
