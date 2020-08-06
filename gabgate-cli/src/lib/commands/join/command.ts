import { CommanderStatic } from 'commander';

import { joinAction } from './action';

export const join = (program: CommanderStatic) => {
	program
		.command('join <hash>')
		.alias('j')
		.description('Join an existing room')
		.action(joinAction);
};
