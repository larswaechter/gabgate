import { CommanderStatic } from 'commander';

import { createAction } from './action';

export const create = (program: CommanderStatic) => {
	program
		.command('create')
		.alias('c')
		.description('Create a new room')
		.action(createAction);
};
