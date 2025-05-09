// import { 
//   getVoiceConnection, 
//   VoiceConnection, 
//   EndBehaviorType,
//   joinVoiceChannel
// } from '@discordjs/voice';
// import { Events, VoiceBasedChannel, VoiceState, GuildMember } from 'discord.js';
// import * as prism from 'prism-media';
// import * as fs from 'fs-extra';
// import * as path from 'path';
// import { spawn } from 'child_process';
// import ffmpegPath from 'ffmpeg-static';

// // Map to store active recording sessions
// const activeRecordings = new Map<string, {
//   connection: VoiceConnection,
//   audioStreams: Map<string, { 
//     stream: any,
//     process: any,
//     username: string,
//     userId: string,
//     filename: string,
//     active: boolean
//   }>
// }>();


// // Map to track user activity to avoid duplicate recordings
// const userSpeakingTracker = new Map<string, {
//   timeout: NodeJS.Timeout | null,
//   active: boolean,
//   lastStartTime: number
// }>();

// // Додаємо глобальну мапу для sessionId по channelId
// const channelSessionMap = new Map<string, string>();

// export default {
//   name: Events.VoiceStateUpdate,
//   once: false,
//   execute: async (oldState: VoiceState, newState: VoiceState) => {
//     try {
//       // When a user joins a voice channel
//       if (newState.channelId && (!oldState.channelId || oldState.channelId !== newState.channelId)) {
//         await handleVoiceChannelJoin(newState.channel);
//       }
      
//       // When a user leaves a voice channel
//       if (oldState.channelId && (!newState.channelId || oldState.channelId !== newState.channelId)) {
//         await handleVoiceChannelLeave(oldState.channel, oldState.member?.id);
//       }
      
//     } catch (error) {
//       console.error('Error in voice recorder event:', error);
//     }
//   }
// };


// /**
//  * Handle when a user joins a voice channel
//  */
// async function handleVoiceChannelJoin(channel: VoiceBasedChannel | null) {
//   if (!channel) return;
  
//   // Count human members
//   const humanCount = channel.members.filter(m => !m.user.bot).size;
  
//   // Start recording if there are humans and we're not already recording this channel
//   if (humanCount > 0 && !activeRecordings.has(channel.id)) {
//     console.log(`Starting recording in channel: ${channel.name}`);
    
//     // Створюємо sessionId для цієї сесії
//     const sessionId = new Date().toISOString().replace(/[:.]/g, '-');
//     channelSessionMap.set(channel.id, sessionId);
    
//     // Create recordings directory if it doesn't exist
//     const recordingsDir = path.join(process.cwd(), 'recordings', channel.guild.id, channel.id, sessionId);
//     await fs.ensureDir(recordingsDir);
    
//     // Join the voice channel if not already connected
//     let connection = getVoiceConnection(channel.guild.id);
//     if (!connection || connection.joinConfig.channelId !== channel.id) {
//       connection = joinVoiceChannel({
//         channelId: channel.id,
//         guildId: channel.guild.id,
//         adapterCreator: channel.guild.voiceAdapterCreator,
//         selfDeaf: false, // We need to hear the audio to record it
//       });
//     }
    
//     // Initialize recorder for this channel
//     const recording = {
//       connection,
//       audioStreams: new Map()
//     };
    
//     activeRecordings.set(channel.id, recording);
    
//     // Set up speaking event for this connection
//     setupSpeakingEvents(channel, connection);
//   }
// }


// /**
//  * Set up speaking events for a connection
//  */
// function setupSpeakingEvents(channel: VoiceBasedChannel, connection: VoiceConnection) {
//   // Speaking started
//   connection.receiver.speaking.on('start', (userId) => {
//     const member = channel.members.get(userId);
//     if (!member || member.user.bot) return;
    
//     const userTrackerId = `channel_${channel.id}_user_${userId}`;
    
//     // Get or create user tracker
//     let userTracker = userSpeakingTracker.get(userTrackerId);
//     if (!userTracker) {
//       userTracker = {
//         timeout: null,
//         active: false,
//         lastStartTime: 0
//       };
//       userSpeakingTracker.set(userTrackerId, userTracker);
//     }
    
//     // If user already speaking or recent start, return
//     if (userTracker.active) {
//       clearTimeout(userTracker.timeout!);
//     } else if (Date.now() - userTracker.lastStartTime < 5000) {
//       // Avoid too frequent starts (< 5 seconds apart)
//       return;
//     }
    
//     userTracker.active = true;
//     userTracker.lastStartTime = Date.now();
    
//     // Start recording
//     const recording = activeRecordings.get(channel.id);
//     if (recording) {
//       startRecordingUser(channel, member, recording);
//     }
    
//     // Set timeout to handle stop if 'end' event doesn't trigger
//     userTracker.timeout = setTimeout(() => {
//       connection.receiver.speaking.emit('end', userId);
//     }, 30000); // 30 second max recording segment
//   });
  

//   // Speaking ended
//   connection.receiver.speaking.on('end', (userId) => {
//     const userTrackerId = `channel_${channel.id}_user_${userId}`;
//     const userTracker = userSpeakingTracker.get(userTrackerId);
    
//     if (userTracker && userTracker.active) {
//       if (userTracker.timeout) {
//         clearTimeout(userTracker.timeout);
//         userTracker.timeout = null;
//       }
      
//       // Set active to false
//       userTracker.active = false;
      
//       // Set a timer to restart after short pause - to avoid stopping/starting on small silences
//       userTracker.timeout = setTimeout(() => {
//         stopRecordingUser(channel.id, userId);
//       }, 5000); // Wait 5 seconds to ensure user really stopped speaking
//     }
//   });
// }



// /**
//  * Handle when a user leaves a voice channel
//  */
// async function handleVoiceChannelLeave(channel: VoiceBasedChannel | null, userId: string | undefined) {
//   if (!channel) return;
  
//   // If a specific user left, stop their recording
//   if (userId) {
//     stopRecordingUser(channel.id, userId);
//     const userTrackerId = `channel_${channel.id}_user_${userId}`;
//     if (userSpeakingTracker.has(userTrackerId)) {
//       const tracker = userSpeakingTracker.get(userTrackerId);
//       if (tracker && tracker.timeout) {
//         clearTimeout(tracker.timeout);
//       }
//       userSpeakingTracker.delete(userTrackerId);
//     }
//   }
  
//   // Count human members
//   const humanCount = channel.members.filter(m => !m.user.bot).size;
  
//   // Stop all recording if there are no humans left
//   if (humanCount === 0 && activeRecordings.has(channel.id)) {
//     console.log(`Stopping recording in channel: ${channel.name} (no humans left)`);
//     await stopRecording(channel.id);
//   }
// }


// /**
//  * Start recording a specific user
//  */
// function startRecordingUser(channel: VoiceBasedChannel, member: GuildMember, recording: {
//   connection: VoiceConnection,
//   audioStreams: Map<string, any>
// }) {
//   const userId = member.id;
  
//   // Skip if already recording this user
//   const existingStream = recording.audioStreams.get(userId);
//   if (existingStream && existingStream.active) return;
  
//   console.log(`Starting to record user: ${member.user.username} (${userId})`);
  
//   // Отримуємо sessionId для цього каналу
//   const sessionId = channelSessionMap.get(channel.id) || new Date().toISOString().replace(/[:.]/g, '-');
  
//   // Create a timestamp for the filename
//   const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
//   const recordingsDir = path.join(process.cwd(), 'recordings', `guild_${channel.guild.id}`, `channel_${channel.id}`, sessionId);
//   const filename = path.join(recordingsDir, `${member.user.username}_${userId}_${timestamp}.mp3`);
  
//   // Create the user metadata file (only once at start)
//   const metadataFile = path.join(recordingsDir, `${member.user.username}_${userId}_${timestamp}.json`);
//   fs.writeFileSync(metadataFile, JSON.stringify({
//     userId: userId,
//     username: member.user.username,
//     nickname: member.nickname,
//     channelId: channel.id,
//     channelName: channel.name,
//     startTime: new Date().toISOString(),
//     guildId: channel.guild.id,
//     guildName: channel.guild.name
//   }, null, 2));
  
//   // Set up audio pipeline for MP3 conversion
//   const audioStream = recording.connection.receiver.subscribe(userId, {
//     end: {
//       behavior: EndBehaviorType.Manual
//     }
//   });
  
//   // Додаємо логування chunk'ів
//   audioStream.on('data', (chunk) => {
//     console.log(`AudioStream data chunk received: ${chunk.length} bytes`);
//   });

//   // Create pipeline for converting to MP3
//   const opusDecoder = new prism.opus.Decoder({ rate: 48000, channels: 1, frameSize: 960 });

  
//   // Use ffmpeg to convert to mp3 - using ffmpeg-static for cross-platform compatibility
//   if (!ffmpegPath) {
//     console.error('ffmpeg-static path is not available. Please make sure it is installed correctly.');
//     return;
//   }
  
//   console.log(`Using ffmpeg from: ${ffmpegPath}`);
  
//   const ffmpeg = spawn(ffmpegPath, [
//     '-i', 'pipe:0',
//     '-acodec', 'libmp3lame',
//     '-b:a', '128k',
//     '-ar', '48000',
//     '-af', 'highpass=f=200,lowpass=f=3000',
//     '-f', 'mp3',
//     filename
//   ]);
  
//   // Додаємо розширене логування
//   ffmpeg.on('error', (err) => {
//     console.error(`FFmpeg process error: ${err}`);
//   });

//   ffmpeg.stderr.on('data', (data) => {
//     console.error(`FFmpeg stderr: ${data}`);
//   });

//   ffmpeg.on('close', (code, signal) => {
//     console.log(`FFmpeg process closed with code ${code}, signal ${signal}`);
//   });

//   ffmpeg.on('exit', (code, signal) => {
//     console.log(`FFmpeg process exited with code ${code}, signal ${signal}`);
//   });
  
//   // Pipe the audio through the pipeline
//   audioStream.on('error', (err) => {
//     console.error('AudioStream error:', err);
//   });
//   opusDecoder.on('error', (err) => {
//     console.error('OpusDecoder error:', err);
//   });
//   ffmpeg.stdin.on('error', (err) => {
//     console.error('FFmpeg stdin error:', err);
//   });

//   audioStream.pipe(opusDecoder).pipe(ffmpeg.stdin);
  
//   // Store the stream
//   recording.audioStreams.set(userId, {
//     stream: audioStream,
//     process: ffmpeg,
//     username: member.user.username,
//     userId: userId,
//     filename: filename,
//     active: true
//   });
// }


// /**
//  * Stop recording a specific user
//  */
// function stopRecordingUser(channelId: string, userId: string) {
//   const recording = activeRecordings.get(channelId);
//   if (!recording || !recording.audioStreams.has(userId)) return;
  
//   const userRecording = recording.audioStreams.get(userId);
//   if (!userRecording || !userRecording.active) return;
  
//   console.log(`Stopping recording for user: ${userRecording.username} (${userId})`);
  
//   // Mark as inactive
//   userRecording.active = false;
  
//   try {
//     // End the audio stream
//     if (userRecording.stream) {
//       userRecording.stream.destroy();
//     }
    
//     // End the FFmpeg process
//     if (userRecording.process && userRecording.process.stdin) {
//       userRecording.process.stdin.end();
//     }
    
//     // Update the metadata file with end time
//     const metadataFile = userRecording.filename.replace('.mp3', '.json');
//     if (fs.existsSync(metadataFile)) {
//       const metadata = JSON.parse(fs.readFileSync(metadataFile, 'utf8'));
//       metadata.endTime = new Date().toISOString();
//       fs.writeFileSync(metadataFile, JSON.stringify(metadata, null, 2));
//     }
//   } catch (error) {
//     console.error(`Error stopping recording for user ${userId}:`, error);
//   }
  
//   // Remove from active streams
//   recording.audioStreams.delete(userId);
// }


// /**
//  * Stop all recording for a channel
//  */
// async function stopRecording(channelId: string) {
//   const recording = activeRecordings.get(channelId);
//   if (!recording) return;
  
//   // Stop all user recordings
//   for (const [userId] of recording.audioStreams) {
//     stopRecordingUser(channelId, userId);
//   }
  
//   // Clean up speaking trackers for this channel
//   for (const [trackerId, tracker] of userSpeakingTracker.entries()) {
//     if (trackerId.startsWith(`${channelId}-`)) {
//       if (tracker.timeout) {
//         clearTimeout(tracker.timeout);
//       }
//       userSpeakingTracker.delete(trackerId);
//     }
//   }
  
//   // Disconnect from the channel - checking state first
//   if (recording.connection && recording.connection.state.status !== 'destroyed') {
//     try {
//       recording.connection.destroy();
//     } catch (error) {
//       console.error('Error destroying voice connection:', error);
//     }
//   }
  
//   activeRecordings.delete(channelId);
// } 