import compression from 'compression';
import helmet from 'helmet';

import { json, NextFunction, Request, Response, Router } from 'express';

import { env } from '../../config/global';

import { AuthService } from '../../services/auth';
import { UtilityService } from '../../services/utility';

/**
 * Init Express middleware
 *
 * @param router Express router instance
 */
export function initMiddleware(router: Router): void {
	router.use(helmet());
	router.use(json());
	router.use(compression());

	router.use((req: Request, res: Response, next: NextFunction) => {
		// Validate client
		req.client = req.get('client');

		if (env.name === 'production' && req.client !== 'gabgate-cli') {
			return res.status(401).send('Unknown client!');
		}

		return next();
	});

	// Setup passport strategy
	AuthService.initStrategy();
}

/**
 * Init Express error handler
 *
 * @param router Express router instance
 */
export function initErrorHandler(router: Router): Response | void {
	router.use((err: Error, req: Request, res: Response, next: NextFunction) => {
		UtilityService.handleError(err);

		return res.status(500).json({
			error: err.message || err,
			status: 500
		});
	});
}
