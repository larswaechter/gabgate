import { initComponentRoutes } from './components/routes';
import { initErrorHandler, initMiddleware } from './middleware';

import { Router } from 'express';

/**
 * Init Express API routes
 *
 * @param router Express router instance
 */
export function initApiRoutes(router: Router): void {
	const prefix: string = '/api/v1';

	initMiddleware(router);
	initComponentRoutes(router, prefix);
	initErrorHandler(router);
}
