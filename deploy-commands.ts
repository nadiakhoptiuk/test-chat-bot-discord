import { REST, Routes } from "discord.js";
import { commands } from "./src/generateCommands";
import validateEnv from "./config/envValidation";

const env = validateEnv();

const rest = new REST().setToken(env.DISCORD_BOT_TOKEN);

(async () => {
	try {
		console.log(`Started refreshing ${commands.length} application (/) commands.`);

		// Register commands for guild (server) - faster for development
		const guildCommands = await rest.put(
			Routes.applicationGuildCommands(env.DISCORD_CLIENT_ID, env.DISCORD_GUILD_ID),
			{ body: commands },
		) as any[];

		console.log(`Successfully reloaded ${guildCommands.length} guild application (/) commands.`);

		// Register global commands (works in DMs) - takes up to 1 hour to propagate
		const globalCommands = await rest.put(
			Routes.applicationCommands(env.DISCORD_CLIENT_ID),
			{ body: commands },
		) as any[];

		console.log(`Successfully registered ${globalCommands.length} global application (/) commands.`);
		console.log('Global commands may take up to an hour to propagate to all servers and DMs.');
	} catch (error) {
		// And of course, make sure you catch and log any errors!
		console.error(error);
	}
})();