import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName('info')
    .setDescription('Replies with info about the bot'),

  execute: async (interaction: ChatInputCommandInteraction) => {
      await interaction.reply(`Bot ${interaction.client.user?.username} is ${interaction.client.user?.presence?.status} and ready to use! Feel free to use the /ping command to check if the bot is online.`);
  },
};