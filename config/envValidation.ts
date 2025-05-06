import dotenv from "dotenv";
import { cleanEnv, str } from "envalid";

dotenv.config();

interface Env {
  DISCORD_BOT_TOKEN: string;
  DISCORD_CLIENT_ID: string;
  DISCORD_GUILD_ID: string;
}

/**
 * Validates environment variables
 * @returns {Env} Validated environment variables
 */
function validateEnv(): Env {
  return cleanEnv(process.env, {
    DISCORD_BOT_TOKEN: str(),
    DISCORD_CLIENT_ID: str(),
    DISCORD_GUILD_ID: str(),
  });
}

export default validateEnv;