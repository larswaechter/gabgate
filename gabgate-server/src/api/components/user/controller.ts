import { bind } from 'decko';
import { NextFunction, Request, Response } from 'express';
import { Model } from 'mongoose';

import { RedisService } from '../../../services/redis';

import { IUser, User } from './model';

export class UserController {
	/**
	 * User database model
	 */
	private userModel: Model<IUser> = User;

	/**
	 * Read users
	 *
	 * @param req Express request
	 * @param res Express response
	 * @param next Express next
	 * @returns HTTP response
	 */
	@bind
	public async readUsers(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
		try {
			const { username } = req.query;

			let where: object = {};

			if (username && username.length) {
				where = { username };
			}

			const users: IUser[] = await this.userModel
				.find(where)
				.populate('friends')
				.exec();

			return res.json({ status: res.statusCode, data: users });
		} catch (err) {
			return next(err);
		}
	}

	/**
	 * Read user by id
	 *
	 * @param req Express request
	 * @param res Express response
	 * @param next Express next
	 * @returns HTTP response
	 */
	@bind
	public async readUserById(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
		try {
			const { userId } = req.params;

			if (!userId) {
				return res.status(400).json({ status: 400, error: 'Invalid request!' });
			}

			const user: IUser | null = await this.userModel
				.findById(userId)
				.populate('friends')
				.exec();

			return res.json({ status: res.statusCode, data: user });
		} catch (err) {
			return next(err);
		}
	}

	/**
	 * Create new user
	 *
	 * @param req Express request
	 * @param res Express response
	 * @param next Express next
	 * @returns HTTP response
	 */
	@bind
	public async createUser(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
		try {
			const { user } = req.body;

			if (!user) {
				return res.status(400).json({ status: 400, error: 'Invalid request!' });
			}

			const newUser: IUser = await new this.userModel(user).save();

			return res.json({ status: res.statusCode, data: newUser });
		} catch (err) {
			return next(err);
		}
	}

	/**
	 * Read connected users
	 *
	 * @param req Express request
	 * @param res Express response
	 * @param next Express next
	 * @returns HTTP response
	 */
	@bind
	public async readConnectedUsers(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
		try {
			const users: string[] = await RedisService.getConnectedUsers();

			return res.json({ status: res.statusCode, data: users });
		} catch (err) {
			return next(err);
		}
	}
}
