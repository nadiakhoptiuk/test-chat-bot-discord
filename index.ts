import validateEnv from './config/envValidation';
import { BotManager } from './src/bot/botManager';

const env = validateEnv(); // { bots: [{clientId, token}, ...], guildId }

const botManager = new BotManager(env.bots.map(bot => ({
  token: bot.token,
  id: bot.clientId
})));