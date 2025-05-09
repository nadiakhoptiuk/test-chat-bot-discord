import { Bot } from './botInstance';
import { VoiceBasedChannel } from 'discord.js';

interface BotConfig {
  token: string;
  id: string;
}

export class BotManager {
  private bots: Bot[] = [];

  constructor(botConfigs: BotConfig[]) {
    this.bots = botConfigs.map(cfg => new Bot(cfg.token, cfg.id));
  }

  getFreeBot(): Bot | null {
    return this.bots.find(bot => !bot.isBusy) || null;
  }

  async joinChannelIfNeeded(channel: VoiceBasedChannel) {
    // Перевіряємо кількість людей у каналі
    const humanCount = channel.members.filter(m => !m.user.bot).size;
    if (humanCount > 1) {
      const freeBot = this.getFreeBot();
      if (freeBot) {
        await freeBot.joinChannel(channel);
      }
    }
  }
}