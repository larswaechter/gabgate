import commander from 'commander';

import { CommandLoader } from './commands';

export const run = () => {
	const program: commander.CommanderStatic = commander;

	program.name('gabgate');

	// Load commands
	CommandLoader.load(program);

	commander.parse(process.argv);
};
