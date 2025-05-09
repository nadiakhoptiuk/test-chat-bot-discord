import { AudioReceiveStream, EndBehaviorType } from "@discordjs/voice";
import { VoiceConnection } from "@discordjs/voice";
import { Guild } from "discord.js";
import path from "path";
import fs from "fs";
import prism from "prism-media";
import { convertPCMToMP3 } from "./convertAudio";
import { createMetaFile, updateMetaFile } from "./createOrUpdateMeta";

const activeStreams = new Map<string, AudioReceiveStream>();

export const recorderRegister = async (connection: VoiceConnection, sessionId: string, guild: Guild) => {
  connection.receiver.speaking.on('start', async (userId) => {
    console.log('START SPEAKING >>> activeStreams:', activeStreams.size)
    console.log(`🎙️ User ${userId} is speaking`);

     if (activeStreams.has(userId)) {
      // Stream exists
      return;
    }

    const audioStream = connection.receiver.subscribe(userId, {
      end: {
        behavior: EndBehaviorType.AfterSilence,
        duration: 1000,
      },
    });

    activeStreams.set(userId, audioStream);
      
    const recordingsDir = path.join(process.cwd(), 'recordings', `guild_${connection.joinConfig.guildId ?? ''}`, `channel_${connection.joinConfig.channelId ?? ''}`, sessionId);

    // Ensure the directory exists
    await fs.promises.mkdir(recordingsDir, { recursive: true });

    const startTime = new Date();
    const outputBase = `${userId}-${Date.now()}`;
    const outputPath = path.join(recordingsDir, `${outputBase}.pcm`);
    const jsonPath = path.join(recordingsDir, `${outputBase}.json`);
    const writeStream = fs.createWriteStream(outputPath);

    // Optional: decode Opus -> PCM
    const decoder = new prism.opus.Decoder({
      rate: 48000,
      channels: 2,
      frameSize: 960,
    });

    // Get username through guild.members.fetch
    let username: string = '';
    try {
      const member = await guild.members.fetch(userId);
      username = member.user.username;
    } catch (e) {
      // user not found
    }

    // Create JSON-file with metadata
    createMetaFile({
      channelId: connection.joinConfig.channelId ?? '',
      guildId: connection.joinConfig.guildId ?? '',
      sessionId: sessionId,
      startRecordingTime: startTime,
      userId: userId,
      username,
      filename: outputBase,
      jsonPath
    });

    audioStream.pipe(decoder).pipe(writeStream);

    audioStream.on('end', () => {
      console.log(`📁 Finished recording: ${outputPath}`);
      activeStreams.delete(userId);
      const mp3Path = outputPath.replace(/\.pcm$/, '.mp3');

      // Update JSON-file with end recording time
      updateMetaFile({
        jsonPath,
        endRecordingTime: new Date()
      });
      convertPCMToMP3(outputPath, mp3Path, jsonPath);
    });
  });
}