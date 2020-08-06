import { bind } from 'decko';
import { NextFunction, Request, Response } from 'express';
import { Model } from 'mongoose';

import { AuthService } from '../../../services/auth';
import { UtilityService } from '../../../services/utility';

import { IUser, User } from '../user/model';

export class AuthController {
	/**
	 * User database model
	 */
	private userModel: Model<IUser> = User;

	/**
	 * Login user
	 *
	 * @param req Express request
	 * @param res Express response
	 * @param next Express next
	 * @returns Returns HTTP response
	 */
	@bind
	public async loginUser(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
		try {
			const { email, password } = req.body;

			if (!email || !password) {
				return res.status(400).json({ status: 400, error: 'Invalid request!' });
			}

			const user: IUser | null = await this.userModel
				.findOne({
					email
				})
				.populate('friends')
				.exec();

			// Wrong email or password
			if (!user || !(await UtilityService.verifyPassword(password, user.password))) {
				return res.status(401).json({ status: 401, error: 'Wrong email or password!' });
			}

			// Create jwt -> required for further requests
			const token: string = AuthService.createToken(user.id);

			delete user.password;

			return res.json({ status: res.statusCode, data: { user, token } });
		} catch (err) {
			return next(err);
		}
	}

	/**
	 * Register new user
	 *
	 * @param req Express request
	 * @param res Express response
	 * @param next Express next
	 * @returns Returns HTTP response
	 */
	@bind
	public async registerUser(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
		try {
			const { email, password, username } = req.body.user;

			if (!email || !password || !username) {
				return res.status(400).json({ status: 400, error: 'Invalid request!' });
			}

			const userByEmail: IUser | null = await this.userModel.findOne({
				email
			});

			// Email is already taken
			if (userByEmail) {
				return res.status(400).json({ status: 400, error: 'Email is already taken!' });
			}

			const userByUsername: IUser | null = await this.userModel.findOne({
				username
			});

			// Username is already taken
			if (userByUsername) {
				return res.status(400).json({ status: 400, error: 'Username is already taken!' });
			}

			const newUser: IUser = await new this.userModel({
				...req.body.user,
				password: await UtilityService.hashPassword(password)
			}).save();

			// Create jwt -> required for further requests
			const token: string = AuthService.createToken(newUser.id);

			delete newUser.password;

			return res.json({ status: res.statusCode, data: { user: newUser, token } });
		} catch (err) {
			return next(err);
		}
	}
}
