import { ActionRowBuilder, ButtonBuilder, SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";
import { botStatus, commandsTable } from "../buttons";

export default {
  data: new SlashCommandBuilder()
    .setName('info')
    .setDescription('Replies with info about the bot'),

  execute: async (interaction: ChatInputCommandInteraction) => {
    const row = new ActionRowBuilder<ButtonBuilder>()
			.addComponents(botStatus, commandsTable);

    await interaction.reply({
      content: 'What question are you interested in? Click the appropriate button below:',
      components: [row]
    });
  },
};