import express from 'express';

import { initApiRoutes } from '../api';

export class ExpressServer {
	/**
	 * Express application
	 */
	private readonly _app: express.Application = express();

	public constructor() {
		initApiRoutes(this._app);
	}

	/**
	 * Returns Express application
	 *
	 * @returns Express app
	 */
	public get app(): express.Application {
		return this._app;
	}
}
