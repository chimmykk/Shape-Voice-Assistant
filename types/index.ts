export type RecordingStatus = 'idle' | 'recording' | 'processing' | 'response';

export interface VoiceResponse {
  text: string;
  audio_url: string;
}