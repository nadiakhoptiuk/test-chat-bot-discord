import { AudioReceiveStream, EndBehaviorType } from "@discordjs/voice";
import { VoiceConnection } from "@discordjs/voice";
import { Guild, VoiceBasedChannel } from "discord.js";
import path from "path";
import fs from "fs";
import prism from "prism-media";
import { createMetaFile, updateMetaFile } from "./createOrUpdateMeta";
import ffmpegPath from "ffmpeg-static";
import { spawn } from "child_process";

const activeStreams = new Map<string, AudioReceiveStream>();

export const recorderRegister = async (connection: VoiceConnection, sessionId: string, guild: Guild, channel: VoiceBasedChannel ) => {
  connection.receiver.speaking.on('start', async (userId) => {
    // console.log('START SPEAKING >>> activeStreams:', activeStreams.size)
    // console.log(`🎙️ User ${userId} is speaking`);

    // Stream for this user already exists
    if (activeStreams.has(userId)) {
      return;
    }

    const audioStream = connection.receiver.subscribe(userId, {
      end: {
        behavior: EndBehaviorType.AfterSilence,
        duration: 5000, // 5 seconds trigger audioStream.on('end',....
      },
    });

    activeStreams.set(userId, audioStream);
      
    const recordingsDir = path.join(process.cwd(), 'recordings', `guild_${connection.joinConfig.guildId ?? ''}`, `channel_${connection.joinConfig.channelId ?? ''}`, sessionId);

    // Ensure the directory exists
    await fs.promises.mkdir(recordingsDir, { recursive: true });

    const startTime = new Date();
    const outputBase = `${userId}-${Date.now()}`;

    const jsonPath = path.join(recordingsDir, `${outputBase}.json`);
    const mp3Path = path.join(recordingsDir, `${outputBase}.mp3`);

    const mp3Stream = fs.createWriteStream(mp3Path);

    // Optional: decode Opus -> PCM
    const decoder = new prism.opus.Decoder({
      rate: 48000,
      channels: 2,
      frameSize: 960,
    });

    const ffmpeg = spawn(ffmpegPath!, [
      '-f', 's16le',       // input format = PCM
      '-ar', '48000',      // sample rate
      '-ac', '2',          // channels
      '-i', 'pipe:0',      // input from stdin
      '-f', 'mp3',         // output format = mp3
      '-acodec', 'libmp3lame', // encoder
      '-b:a', '128k',      // bitrate
      'pipe:1'             // output to stdout
    ]);

    audioStream.pipe(decoder).pipe(ffmpeg.stdin);

    // Write mp3 immediately to file
    ffmpeg.stdout.pipe(mp3Stream);

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

    audioStream.on('end', () => {
      console.log(`📁 Finished recording: ${mp3Path} for user ${username}`);
      activeStreams.delete(userId);
      
      // Update JSON-file with end recording time
      updateMetaFile({
        jsonPath,
        endRecordingTime: new Date()
      });
    });

    audioStream.on('error', (err) => {
      channel.send(`⚠️ Error recording for <@${userId}>: ${err.message}`);
    });
  });
}