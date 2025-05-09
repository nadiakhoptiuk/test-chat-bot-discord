import dotenv from "dotenv";
import { cleanEnv, str } from "envalid";

dotenv.config();

interface BotConfig {
  clientId: string;
  token: string;
}

interface Env {
  bots: BotConfig[];
  guildId: string;
}

/**
 * Validates environment variables for multiple bots
 * @returns {Env} Validated environment variables
 */
function validateEnv(): Env {
  const env = cleanEnv(process.env, {
    DISCORD_GUILD_ID: str(),
  });

  // Collect all keys for bots
  const botConfigs: BotConfig[] = [];
  const ids = Object.keys(process.env)
    .filter((key) => key.startsWith("DISCORD_CLIENT_ID_"))
    .map((key) => key.replace("DISCORD_CLIENT_ID_", ""));

  for (const idx of ids) {
    const clientId = process.env[`DISCORD_CLIENT_ID_${idx}`];
    const token = process.env[`DISCORD_BOT_TOKEN_${idx}`];
    if (!clientId || !token) {
      throw new Error(`Missing clientId or token for bot index ${idx}`);
    }
    botConfigs.push({ clientId, token });
  }

  if (botConfigs.length === 0) {
    throw new Error("No bot configs found in environment variables.");
  }

  return {
    bots: botConfigs,
    guildId: env.DISCORD_GUILD_ID,
  };
}

export default validateEnv;