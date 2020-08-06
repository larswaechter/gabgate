import { Router } from 'express';

import { AuthController } from './controller';

export class AuthRoutes {
	/**
	 * Express router instance
	 */
	private readonly _router: Router = Router();

	/**
	 * AuthController instance
	 */
	private readonly controller: AuthController = new AuthController();

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
	 * Init auth routes
	 */
	private initRoutes() {
		this._router.post('/login', this.controller.loginUser);
		this._router.post('/register', this.controller.registerUser);
	}
}
