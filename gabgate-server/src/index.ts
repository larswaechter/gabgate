import 'reflect-metadata';

import 'source-map-support/register';

import { config } from 'dotenv';

// Load environment variables from .env file
config();

import { Application } from 'express';
import { createServer, Server } from 'http';
import { MongoError } from 'mongodb';
import { connect } from 'mongoose';

import { logger } from './config/logger';
import { env } from './config/global';

import { ExpressServer } from './server/express';
import { SocketServer } from './server/socket';

// Connect to database
connect(
	env.mongodb.url,
	{
		useNewUrlParser: true,
		useUnifiedTopology: true
	},
	(err: MongoError) => {
		if (err) {
			logger.error(err.message);
			throw err;
		}

		// Init express server
		const app: Application = new ExpressServer().app;
		const server: Server = createServer(app);

		// Init socket server
		new SocketServer().startSever(server);

		server.on('listening', () => {
			logger.info(`gabgate-api is running on port ${env.port} in ${env.name} mode`);
		});

		server.listen(env.port);
	}
);
