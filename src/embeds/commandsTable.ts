import { EmbedBuilder } from "discord.js";
import { Table } from 'embed-table';
import { commands } from "../generateCommands";

const table = new Table({
  titles: ['Command name', 'Description'],
  titleIndexes: [0, 16],
  columnIndexes: [0, 16],
  start: '`',
  end: '`',
  padEnd: 3,
  whiteSpace: true
});

commands.forEach((command) => {
  table.addRow([`/${command.name}`, command.description]);
});

export const commandsTableEmbed = new EmbedBuilder().setTitle('Available bot commands').setFields(table.toField());
