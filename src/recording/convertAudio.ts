import ffmpegPath from "ffmpeg-static";
import { spawn } from "child_process";
import fs from "fs";  

export const convertPCMToMP3 = (pcmPath: string, mp3Path: string, jsonPath: string) => {
  console.log('START CONVERTING PCM TO MP3 >>>')
  if (!ffmpegPath) {
    console.error('ffmpeg-static path is not available. Please make sure it is installed correctly.');
    return;
  }
  
  const ffmpeg = spawn(ffmpegPath, [
    '-f', 's16le',
    '-ar', '48000',
    '-ac', '2',
    '-i', pcmPath,
    '-acodec', 'libmp3lame',
    '-b:a', '128k',
    mp3Path
  ]);

  ffmpeg.on('error', (err) => {
    console.error(`❌ FFmpeg process error`);
    // console.error(`err`);
  });

  // ffmpeg.stderr.on('data', (data) => {
    // console.error(`FFmpeg stderr`);
  // });

  ffmpeg.on('close', (code, signal) => {
    if (code === 0) {
      fs.stat(mp3Path, (err, stats) => {
        if (!err && stats.size < 5000) { // 5 кБ — поріг для empty file
          fs.unlink(mp3Path, () => {});
          console.log(`🗑️ Deleted empty (small) MP3.`);

          fs.unlink(jsonPath, () => {});
          console.log(`🗑️ Deleted JSON related to empty (small) MP3.`);
        } else {
          console.log(`✅ Converted to MP3: ${mp3Path}`);
        }
      });
      fs.unlink(pcmPath, (err) => {
        if (err) console.error('Error deleting PCM file:', err);
      });
    } else {
      console.error(`FFmpeg exited with code ${code}, signal ${signal}`);
    }
  });
}