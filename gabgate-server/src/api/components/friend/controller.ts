import { bind } from 'decko';
import { NextFunction, Request, Response } from 'express';
import { Model } from 'mongoose';

import { RedisService } from '../../../services/redis';

import { IUser, User } from '../user/model';

export class FriendController {
	/**
	 * User database model
	 */
	private userModel: Model<IUser> = User;

	/**
	 * Add a friend
	 *
	 * @param req Express request
	 * @param res Express response
	 * @param next Express next
	 * @returns Returns HTTP response
	 */
	@bind
	public async addFriend(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
		try {
			const { userId } = req.params;

			if (!userId) {
				return res.status(400).json({ status: 400, error: 'Invalid request!' });
			}

			const userToAdd: IUser | null = await this.userModel.findById(userId);

			if (!userToAdd) {
				return res.status(404).json({ status: 404, error: 'User not found!' });
			}

			const currentUser: IUser = (await this.userModel.findById((req.user as IUser).id)) as IUser;

			// Add friend
			currentUser.friends.push(userToAdd.id);
			currentUser.save();

			return res.json({ status: res.statusCode, data: currentUser });
		} catch (err) {
			return next(err);
		}
	}

	/**
	 * Remove a friend
	 *
	 * @param req Express request
	 * @param res Express response
	 * @param next Express next
	 * @returns Returns HTTP response
	 */
	@bind
	public async removeFriend(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
		try {
			const { userId } = req.params;

			if (!userId) {
				return res.status(400).json({ status: 400, error: 'Invalid request!' });
			}

			const userToRemove: IUser | null = await this.userModel.findById(userId);

			if (!userToRemove) {
				return res.status(404).json({ status: 404, error: 'User not found!' });
			}

			const currentUser: IUser = (await this.userModel.findById((req.user as IUser).id)) as IUser;

			// Get index of user to remove in friends array
			const userToRemoveIdx = currentUser.friends.findIndex((_userId: string) => _userId === userToRemove.id);

			// User is not a friend of current user
			if (userToRemoveIdx === -1) {
				return res.status(400).json({ status: 400, error: 'User is not a friend!' });
			}

			// Remove friend
			currentUser.friends.splice(userToRemoveIdx, 1);
			currentUser.save();

			return res.json({ status: res.statusCode, data: currentUser });
		} catch (err) {
			return next(err);
		}
	}

	/**
	 * Get online status of friends
	 *
	 * @param req Express request
	 * @param res Express response
	 * @param next Express next
	 * @returns Returns HTTP response
	 */
	@bind
	public async getFriendsOnlineStatus(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
		try {
			const currentUser: IUser = (await this.userModel
				.findById((req.user as IUser).id)
				.populate('friends')
				.exec()) as IUser;

			const friendsOnlineStatus: Promise<boolean>[] = currentUser.friends.map(
				async (user: any) => (await RedisService.hasConnectedUser(user.username)) > 0
			);

			return res.json({ status: res.statusCode, data: friendsOnlineStatus });
		} catch (err) {
			return next(err);
		}
	}
}
