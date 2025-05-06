import { ButtonBuilder, ButtonStyle } from "discord.js";

export const commandsTable = new ButtonBuilder()
  .setCustomId('commandsTable')
  .setLabel('Commands')
  .setStyle(ButtonStyle.Secondary); 