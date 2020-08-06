import { createClient, RedisClient } from 'redis';

import { env } from '../config/global';

export class RedisService {
	public static client: RedisClient = createClient(env.redis);

	private static setNameConnectedUsers: string = 'connected-users';

	/**
	 * Get to socket connected users
	 *
	 * @returns Array of usernames
	 */
	public static getConnectedUsers(): Promise<string[]> {
		return new Promise((resolve: any, reject: any) => {
			RedisService.client.smembers(RedisService.setNameConnectedUsers, (err: Error | null, users: string[]) => {
				if (err) {
					reject(err);
				} else {
					resolve(users);
				}
			});
		});
	}

	/**
	 * Check if user is connected to socket
	 *
	 * @param username
	 * @returns If user is connected to socket or not
	 */
	public static hasConnectedUser(username: string): Promise<number> {
		return new Promise((resolve: any, reject: any) => {
			RedisService.client.sismember(
				RedisService.setNameConnectedUsers,
				username,
				(err: Error | null, numFound: number) => {
					if (err) {
						reject(err);
					} else {
						resolve(numFound);
					}
				}
			);
		});
	}

	/**
	 * Add to socket connected user
	 *
	 * @param username
	 * @returns Number of added users
	 */
	public static addConnectedUser(username: string): Promise<number> {
		return new Promise((resolve: any, reject: any) => {
			RedisService.client.sadd(RedisService.setNameConnectedUsers, username, (err: Error | null, numAdded: number) => {
				if (err) {
					reject(err);
				} else {
					resolve(numAdded);
				}
			});
		});
	}

	/**
	 * Remove to socket connected user
	 *
	 * @param username
	 * @returns Number of removed users
	 */
	public static removeConnectedUser(username: string): Promise<number> {
		return new Promise((resolve: any, reject: any) => {
			RedisService.client.srem(
				RedisService.setNameConnectedUsers,
				username,
				(err: Error | null, numRemoved: number) => {
					if (err) {
						reject(err);
					} else {
						resolve(numRemoved);
					}
				}
			);
		});
	}
}
