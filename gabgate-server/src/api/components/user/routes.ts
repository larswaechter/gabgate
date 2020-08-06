import { Router } from 'express';

import { AuthService } from '../../../services/auth';
import { UserController } from './controller';

export class UserRoutes {
	/**
	 * Express router instance
	 */
	private readonly _router: Router = Router();

	/**
	 * UserController instance
	 */
	private readonly controller: UserController = new UserController();

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
		this._router.get('/', this.controller.readUsers);
		this._router.get('/connected', AuthService.isAuthorized(), this.controller.readConnectedUsers);
		this._router.get('/:userId', AuthService.isAuthorized(), this.controller.readUserById);
		this._router.post('/', AuthService.isAuthorized(), this.controller.createUser);
	}
}
