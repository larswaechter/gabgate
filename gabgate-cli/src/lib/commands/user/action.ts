import { logger } from '../../config/logger';

import { SessionService } from '../../services/session';

export const userAction = () => {
	const user: any = SessionService.user;

	// hide sensible data
	delete user.token;
	delete user.password;

	logger.info(JSON.stringify(user));
};
