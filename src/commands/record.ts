import { ChatInputCommandInteraction, SlashCommandBuilder, GuildMember } from "discord.js";
import { getVoiceConnection, joinVoiceChannel } from "@discordjs/voice";

export default {
  data: new SlashCommandBuilder()
    .setName('record')
    .setDescription('Manages voice recording')
    // Не встановлюємо setDMPermission або setContexts - за замовчуванням команди доступні всюди
    .addSubcommand(subcommand =>
      subcommand
        .setName('start')
        .setDescription('Start recording in the current voice channel'))
    .addSubcommand(subcommand =>
      subcommand
        .setName('stop')
        .setDescription('Stop recording in the current voice channel')),

  execute: async (interaction: ChatInputCommandInteraction) => {
    const subcommand = interaction.options.getSubcommand();
    
    // Перевірка, чи користувач знаходиться на сервері
    if (!interaction.guild) {
      return interaction.reply({ 
        content: 'This command can only be used on a server, not in direct messages.', 
        ephemeral: true 
      });
    }

    // Перевірка, чи користувач знаходиться в голосовому каналі
    const member = interaction.member as GuildMember;
    const voiceChannel = member.voice.channel;
    
    if (!voiceChannel) {
      return interaction.reply({ 
        content: 'You must be in a voice channel to use this command.', 
        ephemeral: true 
      });
    }

    if (subcommand === 'start') {
      // Починаємо запис
      try {
        // Приєднуємось до голосового каналу
        const connection = joinVoiceChannel({
          channelId: voiceChannel.id,
          guildId: interaction.guild.id,
          adapterCreator: interaction.guild.voiceAdapterCreator,
          selfDeaf: false,
        });
        
        await interaction.reply({ 
          content: `✅ Recording has been started in the channel **${voiceChannel.name}**. *All participants will be recorded.*`,  
          ephemeral: true 
        });
      } catch (error) {
        console.error('Error during recording start:', error);

        await interaction.reply({ 
          content: `An error occurred during recording start: ${error}`, 
          ephemeral: true 
        });
      }
    } else if (subcommand === 'stop') {
      // Зупиняємо запис
      try {
        const connection = getVoiceConnection(interaction.guild.id);
        
        if (!connection) {
          return interaction.reply({ 
            content: 'There is no active recording to stop.', 
            ephemeral: true 
          });
        }
        
        connection.destroy();
        
        await interaction.reply({ 
          content: `Recording in the channel **${voiceChannel.name}** has been stopped.`, 
          ephemeral: true 
        });
      } catch (error) {
        console.error('Error during recording stop:', error);
        await interaction.reply({ 
          content: `An error occurred during recording stop: ${error}`, 
          ephemeral: true 
        });
      }
    }
  },
}; 