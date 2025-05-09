import { joinVoiceChannel, getVoiceConnection } from "@discordjs/voice";
import { Events, VoiceBasedChannel, VoiceState } from "discord.js";
import { env } from "process";
import { recorderRegister } from "../recording/recorder";

export default {
  name: Events.VoiceStateUpdate,
  once: false,
  execute: async (oldState: VoiceState, newState: VoiceState) => {
    try {
      if (oldState.member?.user.id === env.DISCORD_CLIENT_ID) {
        console.log('ℹ️  Bot voice state update event has been triggered... Skipped processing the channel...');
        return;
      }

      console.log(`Voice state update event triggered. Member: ${oldState.member?.user.username}`);
      
      // Process both channels regardless of event type
      await processChannel(oldState.channel);
      await processChannel(newState.channel);
      
    } catch (error) {
      console.error('❌ Error in voice channel auto-join event:', error);
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
  console.log(`ℹ️  Channel ${channel.name} has ${humanCount} human members`);
  
  // Get current connection for this guild
  const existingConnection = getVoiceConnection(channel.guild.id);
  
  if (humanCount >= 1) {
    // Join this channel if it has humans and we're not already there
    if (!existingConnection || existingConnection.joinConfig.channelId !== channel.id) {
      console.log(`⏳ Joining channel ${channel.name} with ${humanCount} human members...`);
      
      // Create connection
      const connection = joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator,
        selfDeaf: false,
      });

      const sessionId = new Date().toISOString().replace(/[:.]/g, '-');

      recorderRegister(connection, sessionId, channel.guild);
      console.log(`🤖➡️  Joined voice channel: ${channel.name}`);
    }
  } else {
    // Leave this channel if no humans and we're connected to it
    if (existingConnection && existingConnection.joinConfig.channelId === channel.id) {
      console.log(`⏳ Leaving empty channel ${channel.name}...`);
      existingConnection.destroy();
      console.log(`⬅️🤖 Left voice channel: ${channel.name} (no members left)`);
    }
  }
}