import { initializeClient, connectClient } from "./config/client";
import validateEnv from "./config/envValidation";

const env = validateEnv();

// Initialize the Discord client and set up event listeners
initializeClient();

// Connect to Discord using the token from environment variables
connectClient(env.DISCORD_BOT_TOKEN);
