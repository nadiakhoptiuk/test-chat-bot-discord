import { REST, Routes } from "discord.js";
import { commands } from "./src/generateCommands";
import validateEnv from "./config/envValidation";

const env = validateEnv();

async function deployCommandsForBot(bot: { clientId: string, token: string }, guildId: string) {
	const rest = new REST().setToken(bot.token);

	try {
		console.log(`\n=== Deploying commands for bot ${bot.clientId} ===`);
		// Guild commands
		const guildCommands = await rest.put(
			Routes.applicationGuildCommands(bot.clientId, guildId),
			{ body: commands },
		) as any[];
		console.log(`✅ [${bot.clientId}] Guild commands: ${guildCommands.length}`);

		// Global commands
		const globalCommands = await rest.put(
			Routes.applicationCommands(bot.clientId),
			{ body: commands },
		) as any[];
		console.log(`✅ [${bot.clientId}] Global commands: ${globalCommands.length}`);
		
	} catch (error) {
		console.error(`❌ Error deploying for bot ${bot.clientId}:`, error);
	}
}

(async () => {
	for (const bot of env.bots) {
		await deployCommandsForBot(bot, env.guildId);
	}
})();