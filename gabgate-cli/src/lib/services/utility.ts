import { ChildProcess, spawn } from 'child_process';

import { logger } from '../config/logger';

export class UtilityService {
	/**
	 * Process error and write to log file
	 *
	 * @param err Error object
	 * @param httpCode HTTP error code
	 * @returns Processed error object
	 */
	public static processError(err: Error | undefined, httpCode?: number): Error {
		// Default error message
		let error: Error = new Error('Unexpected error! Please check error log for more details.');

		if (httpCode) {
			switch (httpCode) {
				case 401:
					error = new Error('Unauthorized! JWT expired or not provided, please login.');
					break;
				case 403:
					error = new Error('Forbidden! Access denied.');
					break;
			}
			logger.error(JSON.stringify(error.message));
		} else if (err && err.stack && err.stack.length) {
			logger.error(JSON.stringify(err.stack));
			error = err;
		} else if (err && err.message.length) {
			logger.error(JSON.stringify(err.message));
		}

		return error;
	}

	/**
	 * Play audio file from filesystem
	 *
	 * @param path Path to audio file
	 * @deprecated Notification sound comes from node-notifier module
	 */
	public static playSound(path: string): void {
		let proc: ChildProcess;

		switch (process.platform) {
			case 'win32':
				proc = spawn('powershell', ['-c', '(New-Object System.Media.SoundPlayer "' + path + '").PlaySync();']);
				proc.stdin!.end();
				break;

			case 'darwin':
				proc = spawn('aplay', [path]);
				break;

			case 'linux':
				proc = spawn('aplay', [path]);
				break;

			default:
				logger.warn(`Cannot play sound on current platform (${process.platform})`);
				break;
		}
	}

	/**
	 * Filter usernames of user array
	 *
	 * @param users Users array
	 * @returns Usernames array
	 */
	public static filterUsernames(users: any[]): string[] {
		return users.map((user: any) => user.username);
	}

	/**
	 * Get current date and time
	 *
	 * @returns Current date and time
	 */
	public static getDateTime(): string {
		const now: Date = new Date();

		return (
			UtilityService.addLeadingZero(now.getHours()) +
			':' +
			UtilityService.addLeadingZero(now.getMinutes()) +
			':' +
			UtilityService.addLeadingZero(now.getSeconds())
		);
	}

	/**
	 * Check if string is a valid email address
	 *
	 * @param email Email to validate
	 * @returns If string is valid email
	 */
	public static isValidEmail(email: string): boolean {
		const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		return re.test(String(email).toLowerCase());
	}

	/**
	 * Get string representation of number with leading zero
	 *
	 * @param number
	 * @returns New number as string
	 */
	private static addLeadingZero(number: number): string {
		return number < 10 ? `0${number}` : number.toString();
	}
}
