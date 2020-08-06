import { prompt, QuestionCollection } from 'inquirer';

import { logger } from '../../config/logger';

import { Printer } from '../../modules/printer';

import { SessionService } from '../../services/session';

export const configAction = async () => {
	try {
		const questions: QuestionCollection = [
			{
				choices: ['true', 'false'],
				default: String(SessionService.config.sound),
				message: 'Play sound on message:',
				name: 'sound',
				type: 'list'
			},
			{
				choices: ['true', 'false'],
				default: String(SessionService.config.notification),
				message: 'Show notification on message:',
				name: 'notification',
				type: 'list'
			}
		];

		const config: any = await prompt(questions);

		// Store config
		SessionService.config = { sound: config.sound, notification: config.notification };

		logger.info(SessionService.config);
	} catch (err) {
		Printer.printError(err);
	}
};
