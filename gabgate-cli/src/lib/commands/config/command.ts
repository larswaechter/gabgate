import { CommanderStatic } from 'commander';

import { configAction } from './action';

export const config = (program: CommanderStatic) => {
	program
		.command('config')
		.description('Set user config')
		.action(configAction);
};
