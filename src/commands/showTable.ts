import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { canvasTable } from "../embeds/canvasTable";

export default {
  data: new SlashCommandBuilder()
    .setName('show_table')
    .setDescription('Shows a simple markdown table'),

  // execute: async (interaction: ChatInputCommandInteraction) => {
  //     await interaction.reply({
  //       content: '| Month    | Savings | \n| -------- | ------- | \n| January  | $250    | \n| February | $80     | \n| March    | $420    |',
  //       ephemeral: true
  //     });
  // },

  execute: async (interaction: ChatInputCommandInteraction) => {
    await interaction.reply({
      files: [canvasTable('This is table title!')],
      ephemeral: true
    });
  },
};