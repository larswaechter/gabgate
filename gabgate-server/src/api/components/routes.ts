import { Router } from 'express';

import { AuthRoutes } from './auth/routes';
import { FriendRoutes } from './friend/routes';
import { UserRoutes } from './user/routes';

/**
 * Init Express component routes
 *
 * @param router Express router instance
 * @param prefix Prefix for paths
 */
export function initComponentRoutes(router: Router, prefix: string = ''): void {
	router.use(`${prefix}/auth`, new AuthRoutes().router);
	router.use(`${prefix}/friends`, new FriendRoutes().router);
	router.use(`${prefix}/users`, new UserRoutes().router);
}
