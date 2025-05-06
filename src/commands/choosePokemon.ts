import { ActionRowBuilder, SlashCommandBuilder, ChatInputCommandInteraction, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from "discord.js";

// Map to store pokemon data
export const pokemonOptions = [
  { value: 'bulbasaur', label: 'Bulbasaur', description: 'The dual-type Grass/Poison Seed Pokémon.' },
  { value: 'charmander', label: 'Charmander', description: 'The Fire-type Lizard Pokémon.' },
  { value: 'squirtle', label: 'Squirtle', description: 'The Water-type Tiny Turtle Pokémon.' }
];

export default {
  data: new SlashCommandBuilder()
    .setName('choose_pokemon')
    .setDescription('Choose a pokemon'),

  execute: async (interaction: ChatInputCommandInteraction) => {
    // Create options from the map
    const options = pokemonOptions.map(({ value, label, description }) => 
      new StringSelectMenuOptionBuilder()
        .setLabel(label)
        .setDescription(description)
        .setValue(value)
    );

    const select = new StringSelectMenuBuilder()
      .setCustomId('pokemonSelection')
      .setPlaceholder('Make a selection!')
      .addOptions(options)
      .setMinValues(1)
      .setMaxValues(3);

    const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(select);

    await interaction.reply({
      content: 'Choose your favorite pokemon:',
      components: [row]
    });
  },
};