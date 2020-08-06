# gabgate-cli

A Node.js based realtime chat application for the terminal.

---

## Description

Gabgate is a CLI chat application for realtime messaging based on Node.js. It allows you to easily send or receive text messages and files up to 10MB from your OS's terminal.

## Prerequisites

- Node.js

## Installation

---

First of all, install the required node modules from package.json:

```
npm i
```

Afterwards, open file `src/lib/config/global.ts` and enter your gabgate-server URLs.

Now compile the source code:

```
npm run build
```

Last but not least install the application global:

```
npm i -g
```

Now you can use the CLI from anywhere in your terminal (restart might be required). For example:

```
gabgate register
```

## Commands

List of all available CLI commands:

- `gabgate config` - Setup user config
- `gabgate create` - Create new chat room
- `gabgate friends` - List all friends
- `gabgate friends -a <username>` - Add an user to friends list
- `gabgate friends -r <username` - Remove an user from friends list
- `gabgate join <roomHash>` - Join an existing room
- `gabgate login` - Login as existing user
- `gabgate register` - Register as a new user

Available chat commands:

- `/clear` - Clear terminal chat window
- `/file <filepath>` - Send file
- `/leave` - Leave current room
- `/mute` - Mute current room temporarily
- `/room` - Print current room details
- `/unmute` - Unmute current room temporarily
