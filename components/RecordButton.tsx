import React, { useState, useRef, useEffect } from "react";
import { TouchableOpacity, View, Text, StyleSheet, Animated } from "react-native";
import { Mic, Square } from "lucide-react-native";
import { startRecording, stopRecording } from "@/services/audioService";
import { useVoiceStore } from "@/store/voiceStore";
import { sendAudioToAPI } from "@/services/apiService";

export const RecordButton = () => {
  const { setStatus, setResponse, setError } = useVoiceStore();
  const [isRecording, setIsRecording] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const recordingStartTime = useRef(0);

  // Animate the button when recording
  useEffect(() => {
    let animation: Animated.CompositeAnimation;
    if (isRecording) {
      animation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      animation.start();
    } else {
      pulseAnim.setValue(1);
    }
    return () => {
      if (animation) animation.stop();
    };
  }, [isRecording]);

  // Start recording
  const handleStartRecording = async () => {
    try {
      console.log("Starting recording...");
      setStatus("recording");
      setIsRecording(true);
      recordingStartTime.current = Date.now();
      await startRecording({
        onAudioLevel: (level: number) => {
          // Optionally handle audio level updates here, e.g., for a visualizer
          // console.log("Audio level:", level);
        }
      });
    } catch (error) {
      console.error("Failed to start recording:", error);
      setError(error instanceof Error ? error.message : "Failed to start recording");
      setIsRecording(false);
      setStatus("idle");
    }
  };

  // Stop recording and process
  const handleStopRecording = async () => {
    try {
      console.log("Stopping recording...");
      setStatus("processing");
      setIsRecording(false);
      
      const recordingDuration = Date.now() - recordingStartTime.current;
      console.log(`Recording duration: ${recordingDuration}ms`);
      
      // Ensure minimum recording duration (prevent accidental quick taps)
      if (recordingDuration < 500) {
        setError("Recording too short. Please speak for at least half a second.");
        setStatus("idle");
        return;
      }
      
      const audioBase64 = await stopRecording();
      console.log("Audio captured, sending to API...");
      const response = await sendAudioToAPI(audioBase64);
      setResponse(response);
    } catch (error) {
      console.error("Failed to process recording:", error);
      setError(error instanceof Error ? error.message : "Failed to process recording");
      setStatus("idle");
    }
  };

  const handlePress = () => {
    if (isRecording) {
      handleStopRecording();
    } else {
      handleStartRecording();
    }
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[
        styles.pulse, 
        isRecording && { transform: [{ scale: pulseAnim }] }
      ]}>
        <TouchableOpacity
          style={[
            styles.button, 
            isRecording ? styles.buttonRecording : styles.buttonIdle
          ]}
          onPress={handlePress}
          activeOpacity={0.8}
        >
          {isRecording ? (
            <Square color="#fff" size={32} fill="#fff" />
          ) : (
            <Mic color="#5B7FFF" size={36} />
          )}
        </TouchableOpacity>
      </Animated.View>
      
      <Text style={[
        styles.statusText,
        isRecording && styles.recordingText
      ]}>
        {isRecording ? "Tap to stop recording" : "Tap to start recording"}
      </Text>
      
      {isRecording && (
        <Text style={styles.instructionText}>
          Speak clearly, then tap the stop button
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  pulse: {
    marginBottom: 16,
    borderRadius: 60,
    backgroundColor: "rgba(91,127,255,0.08)",
    padding: 20,
  },
  button: {
    borderRadius: 50,
    padding: 28,
    borderWidth: 3,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#5B7FFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  buttonIdle: {
    backgroundColor: "#fff",
    borderColor: "#5B7FFF",
  },
  buttonRecording: {
    backgroundColor: "#FF4757",
    borderColor: "#FF4757",
  },
  statusText: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  recordingText: {
    color: "#FF4757",
  },
  instructionText: {
    fontSize: 14,
    color: "#8B9DC3",
    textAlign: "center",
    marginTop: 8,
  },
});