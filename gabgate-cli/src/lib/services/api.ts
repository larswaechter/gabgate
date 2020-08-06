import { HttpService } from './http';

import { env } from '../config/global';
import { SessionService } from './session';

/**
 * Service for interacting with gabgate api
 */
export class ApiService {
	/**
	 * HTTP Service for API interactions
	 */
	public static http: HttpService = new HttpService(env.api);

	/**
	 * Login existing user
	 *
	 * @param email User email
	 * @param password User password
	 * @returns Response from login request
	 */
	public static login(email: string, password: string): Promise<any> {
		return ApiService.http.postData('auth/login', { email, password });
	}

	/**
	 * Register new user
	 *
	 * @param email User email
	 * @param username Username
	 * @param password User password
	 * @returns Response from registration request
	 */
	public static register(email: string, username: string, password: string): Promise<any> {
		return ApiService.http.postData('auth/register', {
			user: {
				email,
				password,
				username
			}
		});
	}

	/**
	 * Search for user by username
	 *
	 * @param username Username to search for
	 * @returns User matched with username
	 */
	public static searchUsersByUsername(username: string): Promise<any> {
		return ApiService.http.fetchData('users', { username });
	}

	/**
	 * Search for user by email
	 *
	 * @param username Email to search for
	 * @returns User matched with email
	 */
	public static searchUsersByEmail(email: string): Promise<any> {
		return ApiService.http.fetchData('users', { email });
	}

	/**
	 * Add a user to friends list and refresh local friends list
	 *
	 * @param user User to add to friends list
	 */
	public static async addFriend(user: any): Promise<void> {
		await ApiService.http.postData(`friends/${user._id}`);
		SessionService.refreshFriends();
	}

	/**
	 * Remove a user from friends list and refresh local friends list
	 *
	 * @param user User to remove from friends list
	 */
	public static async removeFriend(user: any): Promise<void> {
		await ApiService.http.deleteData(`friends/${user._id}`);
		SessionService.refreshFriends();
	}

	/**
	 * Get online status of friends
	 */
	public static getFriendsOnlineStatus(): Promise<any> {
		return ApiService.http.fetchData('friends/online');
	}
}
