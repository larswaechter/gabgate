import Configstore from 'configstore';

import { logger } from '../config/logger';

import { ApiService } from './api';
import { UtilityService } from './utility';

export interface IUser {
	email: string;
	id: string;
	username: string;
	token: string;
	friends: string[];
}

export interface IConfig {
	sound: string;
	notification: string;
}

/**
 * Service for user session
 */
export class SessionService {
	public static get store(): Configstore {
		return SessionService._store;
	}

	/**
	 * Return user in session
	 *
	 * @returns Session user
	 */
	public static get user(): IUser {
		return SessionService._user;
	}

	/**
	 * Set user in session
	 *
	 * @param user User to store in session
	 */
	public static set user(user: IUser) {
		SessionService._store.set('user', JSON.stringify(user));
		SessionService._user = user;
	}

	/**
	 * Return config from user session
	 *
	 * @returns user config
	 */
	public static get config(): IConfig {
		return SessionService._config;
	}

	/**
	 * Set user config in session
	 *
	 * @param config User config to store in session
	 */
	public static set config(config: IConfig) {
		SessionService._store.set('config', JSON.stringify(config));
		SessionService._config = config;
	}

	/**
	 * Set default user config
	 */
	public static setDefaultConfig(): void {
		SessionService.config = { sound: 'true', notification: 'true' };
	}

	/**
	 * Delete logged in user from storage
	 */
	public static clearUser(): void {
		SessionService._store.delete('user');
	}

	/**
	 * Return if current user is authenticated
	 *
	 * @returns TRUE when user is authenticated
	 */
	public static isAuthenticated(): boolean {
		return SessionService.user.id && SessionService.user.email && SessionService.user.token ? true : false;
	}

	/**
	 * Exit if current user is not authenticated
	 */
	public static exitOnUnauth(): void {
		if (!SessionService.isAuthenticated()) {
			logger.error('Please login!');
			process.exit(0);
		}
	}

	/**
	 * Fetch data of current user
	 *
	 * @returns Data of current user
	 */
	public static fetchUser(): Promise<any> {
		return ApiService.http.fetchData(`users/${SessionService.user.id}`);
	}

	/**
	 * Get friends with their online status
	 *
	 * @returns Array of friends with status
	 */
	public static async getFriendsWithStatus(): Promise<object[]> {
		const friendsOnlineStatus: boolean[] = await ApiService.getFriendsOnlineStatus();
		const users: object[] = SessionService.user.friends.map((_username, i) => {
			return {
				Status: friendsOnlineStatus[i] === true ? 'Online' : 'Offline',
				Username: _username
			};
		});

		return users;
	}

	/**
	 * Fetch friends and save to config store
	 *
	 * @param friends Friends to save in config store
	 */
	public static async refreshFriends(friends?: any[]): Promise<void> {
		if (friends) {
			SessionService.user = {
				...SessionService.user,
				friends: UtilityService.filterUsernames(friends)
			};
		} else {
			const user = await SessionService.fetchUser();
			SessionService.user = {
				...SessionService.user,
				friends: UtilityService.filterUsernames(user.friends)
			};
		}
	}

	/**
	 * Config storage
	 */
	private static _store = new Configstore('gabgate');

	/**
	 * Session user
	 */
	private static _user: IUser = JSON.parse(SessionService._store.get('user') || '{}');

	/**
	 * Session user config
	 */
	private static _config: IConfig = JSON.parse(SessionService._store.get('config') || '{}');
}
