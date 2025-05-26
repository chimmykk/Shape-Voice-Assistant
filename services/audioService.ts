import { Audio } from 'expo-av';
import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';

let recording: Audio.Recording | null = null;
let sound: Audio.Sound | null = null;
let meteringInterval: NodeJS.Timeout | null = null;

export const startRecording = async (p0: { onAudioLevel: (level: number) => void; }): Promise<void> => {
  try {
    // Request permissions
    const permission = await Audio.requestPermissionsAsync();
    if (!permission.granted) {
      throw new Error("Permission to access microphone was denied");
    }

    // Configure audio mode
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
    });

    // Create and start recording
    const { recording: newRecording } = await Audio.Recording.createAsync(
      {
        ...Audio.RecordingOptionsPresets.HIGH_QUALITY,
        android: {
          ...Audio.RecordingOptionsPresets.HIGH_QUALITY.android,
        },
        ios: {
          ...Audio.RecordingOptionsPresets.HIGH_QUALITY.ios,
        },
      }
    );
    recording = newRecording;

    // Start polling for audio level
    meteringInterval = setInterval(async () => {
      if (recording) {
        const status = await recording.getStatusAsync();
        // status.metering is between -160 (silence) and 0 (loudest)
        if (status.metering != null) {
          // Normalize to 0..1
          const level = Math.pow(10, status.metering / 20);
          p0.onAudioLevel(level);
        }
      }
    }, 150); // Poll every 150ms
  } catch (error) {
    console.error('Failed to start recording', error);
    throw error;
  }
};

export const stopRecording = async (): Promise<string> => {
  try {
    if (!recording) {
      throw new Error("No recording in progress");
    }
    if (meteringInterval) {
      clearInterval(meteringInterval);
      meteringInterval = null;
    }
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    recording = null;

    if (!uri) {
      throw new Error("Recording failed to save");
    }

    // Convert to base64
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    return `data:audio/mp3;base64,${base64}`;
  } catch (error) {
    console.error('Failed to stop recording', error);
    throw error;
  }
};

export const playAudio = async (audioUrl: string): Promise<void> => {
  try {
    // If it's a base64 URL, we need to handle it differently on web
    if (audioUrl.startsWith('data:audio') && Platform.OS === 'web') {
      // For web, we need to use the Web Audio API but through Expo's API
      const audioElement = document.createElement('audio');
      audioElement.src = audioUrl;
      audioElement.play();
      return;
    }

    // For native platforms
    if (sound) {
      await sound.unloadAsync();
    }

    const { sound: newSound } = await Audio.Sound.createAsync(
      { uri: audioUrl },
      { shouldPlay: true }
    );
    
    sound = newSound;
    
    // Clean up when done
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        sound?.unloadAsync();
      }
    });
  } catch (error) {
    console.error('Failed to play audio', error);
    throw error;
  }
};