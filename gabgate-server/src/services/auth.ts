import { bind } from 'decko';
import { Handler, NextFunction, Request, Response } from 'express';

import { sign, SignOptions } from 'jsonwebtoken';
import { use } from 'passport';
import { ExtractJwt, StrategyOptions } from 'passport-jwt';

import { env } from '../config/global';

import { JwtStrategy } from '../api/components/auth/strategies/jwt';

enum JWT_OPTIONS {
	audience = 'gabgate-cli',
	issuer = 'gabgate-api'
}

export class AuthService {
	/**
	 * Strategy options for Passport-JWt
	 */
	public static readonly strategyOptions: StrategyOptions = {
		audience: JWT_OPTIONS.audience,
		issuer: JWT_OPTIONS.issuer,
		jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
		secretOrKey: env.jwtSecret
	};

	/**
	 * Sign options for JWT
	 */
	public static readonly signOptions: SignOptions = {
		audience: JWT_OPTIONS.audience,
		expiresIn: '5d',
		issuer: JWT_OPTIONS.issuer
	};

	public static jwtStrategy: JwtStrategy = new JwtStrategy(AuthService.strategyOptions);

	/**
	 * Init passport strategy
	 *
	 */
	public static initStrategy(): void {
		use('jwt', AuthService.jwtStrategy.strategy);
	}

	/**
	 * Create json web token for authentication
	 *
	 * @param userId Unique user id
	 * @returns JWT
	 */
	public static createToken(userId: number): string {
		return sign({ userId }, env.jwtSecret, AuthService.signOptions);
	}

	/**
	 * Setup target passport authorization
	 *
	 * @param strategy Passport strategy
	 * @returns Returns if user is authorized
	 */
	@bind
	public static isAuthorized(): Handler {
		return (req: Request, res: Response, next: NextFunction) => {
			try {
				return AuthService.jwtStrategy.isAuthorized(req, res, next);
			} catch (err) {
				return next(err);
			}
		};
	}
}
