import { ActionRowBuilder, SlashCommandBuilder, ChatInputCommandInteraction, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName('choose_pokemon')
    .setDescription('Choose a pokemon'),

  execute: async (interaction: ChatInputCommandInteraction) => {
    const select = new StringSelectMenuBuilder()
			.setCustomId('pokemonSelection')
			.setPlaceholder('Make a selection!')
			.addOptions(
				new StringSelectMenuOptionBuilder()
					.setLabel('Bulbasaur')
					.setDescription('The dual-type Grass/Poison Seed Pokémon.')
					.setValue('bulbasaur'),
				new StringSelectMenuOptionBuilder()
					.setLabel('Charmander')
					.setDescription('The Fire-type Lizard Pokémon.')
					.setValue('charmander'),
				new StringSelectMenuOptionBuilder()
					.setLabel('Squirtle')
					.setDescription('The Water-type Tiny Turtle Pokémon.')
					.setValue('squirtle'),
			)
			.setMinValues(1)
			.setMaxValues(3);

    const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(select);

    await interaction.reply({
      content: 'Choose your favorite pokemon:',
      components: [row]
    });
  },
};