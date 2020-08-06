# gabgate-api

Express.js based REST API for gabgate-cli

## Prerequisites

- Node.js
- MongoDB

## Installation

First of all, create a new MongoDB `gabgate` database and a `users` collection.

```
use gabgate
db.createCollection("users")
```

Create a new environment file and enter your secret information:

```
cp .env.example .env
```

Afterwards, install the required node modules from package.json and compile the source code:

```
npm i
npm run build
```

Last but not least start the application:

```
npm start
```

Your server should run now.
