import fs from 'fs';
import path from 'path';

interface CreateMetaFileParams {
  channelId: string;
  guildId: string;
  sessionId: string;
  startRecordingTime: Date;
  userId: string;
  username: string;
  filename: string;
  jsonPath: string;
}

interface UpdateMetaFileParams {
  jsonPath: string;
  endRecordingTime: Date;
}

export function createMetaFile(params: CreateMetaFileParams) {
  const meta = {
    channelId: params.channelId,
    guildId: params.guildId,
    sessionId: params.sessionId,
    startRecordingTimeISO: params.startRecordingTime.toISOString(),
    startRecordingTimeLocal: params.startRecordingTime.toLocaleString(),
    endRecordingTimeISO: null as string | null,
    endRecordingTimeLocal: null as string | null,
    userId: params.userId,
    username: params.username,
    filename: params.filename
  };
  fs.writeFileSync(params.jsonPath, JSON.stringify(meta, null, 2));
}

export function updateMetaFile(params: UpdateMetaFileParams) {
  let meta: any = {};
  try {
    if (fs.existsSync(params.jsonPath)) {
      meta = JSON.parse(fs.readFileSync(params.jsonPath, 'utf8'));
    }
  } catch (e) {}
  meta.endRecordingTimeISO = params.endRecordingTime.toISOString();
  meta.endRecordingTimeLocal = params.endRecordingTime.toLocaleString();
  fs.writeFileSync(params.jsonPath, JSON.stringify(meta, null, 2));
} 