export const env = {
	name: process.env.NODE_ENV,
	port: process.env.NODE_PORT,
	mongodb: {
		url: process.env.MONGODB_URL || 'mongodb://localhost/gabgate'
	},
	redis: {
		host: process.env.REDIS_HOST || 'localhost',
		password: process.env.REDIS_PASS,
		port: 6379
	},
	jwtSecret: process.env.JWT_SECRET || 'gabgatesecretjwt'
};
