import { joinVoiceChannel, getVoiceConnection, createAudioPlayer, NoSubscriberBehavior } from "@discordjs/voice";
import { Events, VoiceBasedChannel, VoiceState } from "discord.js";

export default {
  name: Events.VoiceStateUpdate,
  once: false,
  execute: async (oldState: VoiceState, newState: VoiceState) => {
    try {
      console.log("Voice state update event triggered");
      
      // Process both channels regardless of event type
      await processChannel(oldState.channel);
      await processChannel(newState.channel);
      
    } catch (error) {
      console.error('Error in voice channel auto-join event:', error);
    }
  }
};



/**
 * Process a voice channel - join if there are users, leave if empty
 * @param channel The voice channel to process
 */
async function processChannel(channel: VoiceBasedChannel | null) {
  // Skip if channel is null
  if (!channel) return;
  
  // Count how many non-bot members are in the channel
  const humanCount = channel.members.filter(m => !m.user.bot).size;
  console.log(`Channel ${channel.name} has ${humanCount} human members`);
  
  // Get current connection for this guild
  const existingConnection = getVoiceConnection(channel.guild.id);
  
  if (humanCount >= 1) {
    // Join this channel if it has humans and we're not already there
    if (!existingConnection || existingConnection.joinConfig.channelId !== channel.id) {
      console.log(`Joining channel ${channel.name} with ${humanCount} human members`);
      
      // Create connection
      const connection = joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator,
        selfDeaf: false,
      });
      
      // Create audio player to keep connection active
      const player = createAudioPlayer({
        behaviors: {
          noSubscriber: NoSubscriberBehavior.Pause,
        },
      });
      
      connection.subscribe(player);
      console.log(`🤖 Joined voice channel: ${channel.name}`);
    }
  } else {
    // Leave this channel if no humans and we're connected to it
    if (existingConnection && existingConnection.joinConfig.channelId === channel.id) {
      console.log(`Leaving empty channel ${channel.name}`);
      existingConnection.destroy();
      console.log(`🤖 Left voice channel: ${channel.name} (no members left)`);
    }
  }
}