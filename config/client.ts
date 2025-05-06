import { Client, Collection, Events, GatewayIntentBits } from "discord.js";
import { commandObjects } from "../src/generateCommands";
import { setUpEvents } from "../src/generateEvents";

export interface ClientWithCommands extends Client {
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
        GatewayIntentBits.GuildIntegrations,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildPresences
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
  setUpEvents();
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