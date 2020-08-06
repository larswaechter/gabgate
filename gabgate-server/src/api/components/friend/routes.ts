import { Router } from 'express';

import { AuthService } from '../../../services/auth';
import { FriendController } from './controller';

export class FriendRoutes {
	/**
	 * Express router instance
	 */
	private readonly _router: Router = Router();

	/**
	 * FriendController instance
	 */
	private readonly controller: FriendController = new FriendController();

	public constructor() {
		this.initRoutes();
	}

	/**
	 * Returns express router instance
	 *
	 * @returns Express router
	 */
	public get router(): Router {
		return this._router;
	}

	/**
	 * Init user routes
	 */
	private initRoutes() {
		this._router.post('/:userId', AuthService.isAuthorized(), this.controller.addFriend);
		this._router.delete('/:userId', AuthService.isAuthorized(), this.controller.removeFriend);
		this._router.get('/online', AuthService.isAuthorized(), this.controller.getFriendsOnlineStatus);
	}
}
