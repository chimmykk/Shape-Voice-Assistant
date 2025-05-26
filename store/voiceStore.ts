import { create } from 'zustand';
import { RecordingStatus, VoiceResponse } from '@/types';

interface VoiceState {
  status: RecordingStatus;
  response: VoiceResponse | null;
  error: string | null;
  setStatus: (status: RecordingStatus) => void;
  setResponse: (response: VoiceResponse) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useVoiceStore = create<VoiceState>((set) => ({
  status: 'idle',
  response: null,
  error: null,
  setStatus: (status) => set({ status }),
  setResponse: (response) => set({ response, status: 'response' }),
  setError: (error) => set({ error }),
  reset: () => set({ status: 'idle', response: null, error: null }),
}));