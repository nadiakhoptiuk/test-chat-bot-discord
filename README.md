# Discord Bot

A TypeScript Discord bot with slash command support.

## Environment Setup

This project requires the following environment variables in a `.env` file:

```
DISCORD_BOT_TOKEN=your_bot_token
DISCORD_CLIENT_ID=your_client_id
DISCORD_GUILD_ID=your_guild_id
```

To obtain these values:

1. **DISCORD_BOT_TOKEN**: Create a bot in the [Discord Developer Portal](https://discord.com/developers/applications) → Bot section
2. **DISCORD_CLIENT_ID**: Available in the General Information section of your application
3. **DISCORD_GUILD_ID**: Enable Developer Mode in Discord App settings, then right-click your server and select "Copy ID"

## Getting Started

### Prerequisites

- Node.js (v16+)
- npm

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file with the required environment variables

## Available Commands

### Development

Start the bot in development mode:

```
npm run dev
```

This command uses ts-node to run the TypeScript code directly without compiling first.

### Deploy Slash Commands

Register slash commands with Discord:

```
npx ts-node deploy-commands.ts
```

This must be done:
- When you first create a command
- When you modify a command's structure
- When you add new commands

### Build

Compile TypeScript to JavaScript:

```
npm run build
```

### Production

Run the compiled code:

```
npm start
```

## Project Structure

- **config/**: Configuration files and client setup
- **src/commands/**: Slash command definitions
- **deploy-commands.ts**: Script to register commands with Discord
- **index.ts**: Main entry point
