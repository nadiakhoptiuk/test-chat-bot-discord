import { Client, GatewayIntentBits } from "discord.js";

let client: Client | null = null;

/**
 * Returns a singleton instance of the Discord client
 * @returns {Client} The Discord client instance
 */
export function getClient(): Client {
  if (!client) {
    client = new Client({ 
      intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent
      ] 
    });
  }
  return client;
}

/**
 * Initializes the Discord client and sets up event listeners
 */
export function initializeClient(): void {
  const client = getClient();
  
  client.on("ready", () => {
    if (client.user) {
      console.log(`Bot ${client.user.tag} is ready`);
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
  const client = getClient();
  return client.login(token);
} 