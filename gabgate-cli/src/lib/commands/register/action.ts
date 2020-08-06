import { prompt, QuestionCollection } from 'inquirer';

import { Printer } from '../../modules/printer';

import { ApiService } from '../../services/api';
import { SessionService } from '../../services/session';
import { UtilityService } from '../../services/utility';

export const registerAction = async () => {
	try {
		const questions: QuestionCollection = [
			{
				message: 'Enter your email:',
				name: 'email',
				type: 'input',
				async validate(value: string) {
					if (!UtilityService.isValidEmail(value)) {
						return 'Please enter a valid email address!';
					} else if ((await ApiService.searchUsersByEmail(value)).length) {
						return 'This email is already taken!';
					}
					return true;
				}
			},
			{
				message: 'Enter an username:',
				name: 'username',
				type: 'input',
				async validate(value: string) {
					if (value.length < 4) {
						return 'Please enter an username with at least four characters!';
					} else if ((await ApiService.searchUsersByUsername(value)).length) {
						return 'This username is already taken!';
					}
					return true;
				}
			},
			{
				message: 'Enter a password:',
				name: 'password',
				type: 'password',
				validate(value: string) {
					if (value.length) {
						return true;
					} else {
						return 'Please enter a password!';
					}
				}
			}
		];

		const { email, username, password } = await prompt(questions);
		const { user, token } = await ApiService.register(email, username, password);

		// Store user if token is provided
		if (user && token) {
			SessionService.clearUser();

			SessionService.user = {
				email: user.email,
				friends: UtilityService.filterUsernames(user.friends),
				id: user.id,
				token,
				username: user.username
			};
			SessionService.setDefaultConfig();
			Printer.printInfo(`Registrated successfully, welcome ${SessionService.user.username}!`);
		} else {
			Printer.printError(new Error('Registration failed!'));
		}
	} catch (err) {
		Printer.printError(err);
	}
};
