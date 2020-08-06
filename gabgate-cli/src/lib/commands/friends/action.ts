import { Printer } from '../../modules/printer';

import { ApiService } from '../../services/api';
import { SessionService } from '../../services/session';

export const friendsAction = async (username: string, options: any) => {
	try {
		SessionService.exitOnUnauth();

		// Add or remove user from friends list
		if (username) {
			/**
			 * Search for user with given username
			 * We get an array with users, so we have to filter for the first match
			 */
			const users: any[] = await ApiService.searchUsersByUsername(username);
			const user: any = users.find(_user => _user.username === username);

			if (user) {
				await SessionService.refreshFriends();

				const isFriend: boolean = SessionService.user.friends.includes(user.username);

				// Add user
				if (options.add) {
					if (isFriend) {
						Printer.printError(new Error(`User ${username} is already your friend!`));
						return;
					}

					await ApiService.addFriend(user);
					Printer.printInfo(`Added user ${username} to your friends list!`);

					// Remove user
				} else if (options.remove) {
					if (!isFriend) {
						Printer.printError(new Error(`User ${username} was not found in your friends list!`));
						return;
					}

					await ApiService.removeFriend(user);
					Printer.printInfo(`Removed user ${username} from your friends list!`);
				}
			} else {
				Printer.printError(new Error(`User ${username} not found!`));
			}

			// List all friends
		} else {
			console.table(await SessionService.getFriendsWithStatus(), ['Username', 'Status']);
		}
	} catch (err) {
		Printer.printError(err);
	}
};
