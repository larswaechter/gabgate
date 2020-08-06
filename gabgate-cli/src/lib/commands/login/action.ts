import { prompt, QuestionCollection } from 'inquirer';

import { Printer } from '../../modules/printer';

import { ApiService } from '../../services/api';
import { SessionService } from '../../services/session';
import { UtilityService } from '../../services/utility';

export const loginAction = async () => {
	try {
		const questions: QuestionCollection = [
			{
				message: 'Enter your email:',
				name: 'email',
				type: 'input',
				validate(value: string) {
					if (!UtilityService.isValidEmail(value)) {
						return 'Please enter a valid email address!';
					} else {
						return true;
					}
				}
			},
			{
				message: 'Enter your password:',
				name: 'password',
				type: 'password',
				validate(value: string) {
					if (value.length) {
						return true;
					} else {
						return 'Please enter your password!';
					}
				}
			}
		];

		const { email, password } = await prompt(questions);
		const { user, token } = await ApiService.login(email, password);

		// Store user if token is provided
		if (user && token) {
			SessionService.clearUser();

			SessionService.user = {
				email: user.email,
				friends: UtilityService.filterUsernames(user.friends),
				id: user._id,
				token,
				username: user.username
			};

			SessionService.setDefaultConfig();
			Printer.printInfo(`Logged in successfully, welcome ${SessionService.user.username}!`);
		} else {
			Printer.printError(new Error('Login failed!'));
		}
	} catch (err) {
		Printer.printError(err);
	}
};
