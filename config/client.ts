import { Client, Collection, Events, GatewayIntentBits } from "discord.js";
import { commandObjects } from "../src/commands";

interface ClientWithCommands extends Client {
  commands: Collection<string, any>;
}

let client: ClientWithCommands | null = null;

/**
 * Returns a singleton instance of the Discord client
 * @returns {ClientWithCommands} The Discord client instance
 */
export function getClientWithCommands(): ClientWithCommands {
  if (!client) {
    client = new Client({ 
      intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildIntegrations
      ] 
    }) as ClientWithCommands;

    client.commands = new Collection();

    for (const command of commandObjects) {
      client?.commands.set(command.data.name, command);
    }
  }

  return client;
}


/**
 * Initializes the Discord client and sets up event listeners
 */
export function initializeClient(): void {
  const client = getClientWithCommands();
  
  client.on("ready", () => {
    if (client.user) {
      console.log(`Bot ${client.user.tag} is ready`);
    }
  });

  client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = (interaction.client as ClientWithCommands).commands.get(interaction.commandName);

    if (!command) {
      console.error(`No command matching ${interaction.commandName} was found.`);
      return;
    }

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(error);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: 'There was an error executing this command!', ephemeral: true });
      } else {
        await interaction.reply({ content: 'There was an error executing this command!', ephemeral: true });
      }
    }
  });
  
  client.on("messageCreate", (message) => {
    if (message.content.trim().toLowerCase() === "ping") {
      message.reply("Pong!");
    }
  });
}

/**
 * Connects the client to Discord with the provided token
 * @param {string} token - The Discord bot token
 * @returns {Promise<string>} Promise representing the login process
 */
export function connectClient(token: string): Promise<string> {
  const client = getClientWithCommands();
  return client.login(token);
} 