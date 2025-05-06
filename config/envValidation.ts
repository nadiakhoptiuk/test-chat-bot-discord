import dotenv from "dotenv";
import { cleanEnv, str } from "envalid";

dotenv.config();

interface Env {
  DISCORD_BOT_TOKEN: string;
}

/**
 * Validates environment variables
 * @returns {Env} Validated environment variables
 */
function validateEnv(): Env {
  return cleanEnv(process.env, {
    DISCORD_BOT_TOKEN: str(),
  });
}

export default validateEnv;