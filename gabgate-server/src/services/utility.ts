import { compare, genSalt, hash } from 'bcryptjs';
import crypto from 'crypto';
import { v1 as uuidv1 } from 'uuid';

import { logger } from '../config/logger';

export class UtilityService {
	/**
	 * Error handler
	 *
	 * @param err Error
	 */
	public static handleError(err: any): void {
		logger.error(err.stack || err);
	}

	/**
	 * Hash plain password
	 *
	 * @param plainPassword Plain password to hash
	 * @returns Hashed password
	 */
	public static hashPassword(plainPassword: string): Promise<string> {
		return new Promise((resolve, reject) => {
			genSalt(10, (err: any, salt: string) => {
				if (err) {
					reject(err);
				}

				hash(plainPassword, salt, (error: any, hashedVal: string) => {
					if (error) {
						reject(error);
					}

					resolve(hashedVal);
				});
			});
		});
	}

	/**
	 * Compare plain password with hashed password
	 *
	 * @param plainPassword plain password to compare
	 * @param hashedPassword hashed password to compare
	 * @returns Returns if passwords match
	 */
	public static verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
		return new Promise((resolve, reject) => {
			compare(plainPassword, hashedPassword, (err, res) => {
				if (err) {
					reject(err);
				}
				resolve(res);
			});
		});
	}

	/**
	 * Hash string with sha256 algorithm - don't use for passwords
	 *
	 * @param string String to hash
	 * @returns Hashed string
	 */
	public static hashString(string: string): string {
		return crypto
			.createHash('sha256')
			.update(string)
			.digest('hex');
	}

	/**
	 * Generate uuid
	 *
	 * @returns UUID
	 */
	public static generateUuid(): string {
		return uuidv1();
	}
}
