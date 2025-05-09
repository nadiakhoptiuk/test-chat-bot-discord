import { Events, Interaction } from "discord.js";
import { ClientWithCommands } from "../../config/client";
import { commandsTableEmbed } from "../embeds/commandsTable";
import { pokemonOptions } from "../commands/choosePokemon";
import { feedbackEmbed } from "../embeds/feedbackBlock";

export default {
  name: Events.InteractionCreate,
  once: false,
  execute: async (interaction: Interaction) => {
    if (!interaction.isChatInputCommand() && !interaction.isButton() && !interaction.isStringSelectMenu() && !interaction.isModalSubmit()) return;

    
    // Button Interaction
    if (interaction.isButton()) {
      const buttonId = interaction.customId;
      
      switch (buttonId) {
        case 'botStatus':
          await interaction.reply({ content: `The Bot '${interaction.client.user?.username}' is ${interaction.client.user?.presence?.status.toUpperCase()} and ready to use!` });
          break;
        
        case 'commandsTable':
          await interaction.reply({ content: `Commands`, embeds: [commandsTableEmbed] });
          break;
      }
    }


    // Chat Input Command
    if (interaction.isChatInputCommand()) {
      const command = (interaction.client as ClientWithCommands).commands.get(interaction.commandName);

      if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
      }

      try {
        await command.execute(interaction);
      } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp({ content: 'There was an error executing this command!', ephemeral: true });
        } else {
          await interaction.reply({ content: 'There was an error executing this command!', ephemeral: true });
        }
      }
    }


    // String Select Menu
    if (interaction.isStringSelectMenu()) {
      const id = interaction.customId;

      switch (id) {
        case 'pokemonSelection':
          // Convert values to labels using the map
          const pokemonLabels = interaction.values.map(value => 
            pokemonOptions.find(option => option.value === value)?.label || value // Fallback to value if label not found
          ).join(', ');
          
          await interaction.reply({ content: `You selected ${pokemonLabels}. Great choice!` });
          break;
      }
    } 


    // Modal Interaction
    if (interaction.isModalSubmit()) {
      const modalId = interaction.customId;
      
      switch (modalId) {
        case 'feedbackModal':
          const feedback = interaction.fields.getTextInputValue('feedbackInput');
          const points = interaction.fields.getTextInputValue('pointsInput');
          
          // Check if points is a valid number between 1-5
          const pointsNumber = parseInt(points);
          if (isNaN(pointsNumber) || pointsNumber < 1 || pointsNumber > 5) {
            await interaction.reply({ content: '❌ Please enter a valid number for points (from 1 to 5).' });
            return;
          }
          
          // Create a feedback embed using the imported function
          await interaction.reply({ 
            embeds: [feedbackEmbed(pointsNumber, feedback)],
          });
          break;
      }
    }
  }
};

