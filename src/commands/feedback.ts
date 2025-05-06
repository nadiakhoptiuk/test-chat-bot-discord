import { ActionRowBuilder, ChatInputCommandInteraction, ModalBuilder, SlashCommandBuilder, TextInputBuilder, TextInputStyle } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName('feedback')
    .setDescription('Send feedback about the bot'),

  execute: async (interaction: ChatInputCommandInteraction) => {
    const modal = new ModalBuilder()
    .setCustomId('feedbackModal')
    .setTitle('Feedback');

    const feedbackInput = new TextInputBuilder()
      .setCustomId('feedbackInput')
      .setLabel('Enter your feedback about the bot here')
      .setPlaceholder('My experience with the bot has been...')
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true);
    
    const pointsInput = new TextInputBuilder()
      .setCustomId('pointsInput')
      .setLabel('Rate the bot from 1-5')
      .setPlaceholder('5')
      .setMinLength(1)
      .setMaxLength(1)
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const feedbackInputRow = new ActionRowBuilder<TextInputBuilder>().addComponents(feedbackInput);
    const pointsInputRow = new ActionRowBuilder<TextInputBuilder>().addComponents(pointsInput);

    modal.addComponents(feedbackInputRow, pointsInputRow);

    await interaction.showModal(modal);
  },
};