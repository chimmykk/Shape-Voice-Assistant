import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, Animated, Easing } from 'react-native';
import { useVoiceStore } from '@/store/voiceStore';
import { playAudio } from '@/services/audioService';

export const ResponseDisplay = () => {
  const { status, response, error } = useVoiceStore();

  // Animated dots for processing
  const dotAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (status === 'processing') {
      Animated.loop(
        Animated.timing(dotAnim, {
          toValue: 3,
          duration: 1200,
          easing: Easing.linear,
          useNativeDriver: false,
        })
      ).start();
    } else {
      dotAnim.setValue(0);
    }
  }, [status]);

  useEffect(() => {
    if (status === 'response' && response?.audio_url) {
      playAudio(response.audio_url).catch(err => {
        console.error('Failed to play audio:', err);
      });
    }
  }, [status, response]);

  // Helper to show animated dots
  const renderProcessingDots = () => {
    const dots = ['.', '.', '.'];
    const animatedDots = dotAnim.interpolate({
      inputRange: [0, 1, 2, 3],
      outputRange: [0, 1, 2, 3],
    });
    return (
      <Animated.Text style={styles.processingDots}>
        {dots.slice(0, Math.floor((dotAnim as any).__getValue()) + 1).join('')}
      </Animated.Text>
    );
  };

  if (status === 'idle') {
    return (
      <View style={styles.container}>
        <Text style={styles.idleText}>
          Tap the microphone button and ask me anything
        </Text>
      </View>
    );
  }

  if (status === 'recording') {
    return (
      <View style={styles.container}>
        <Text style={styles.recordingText}>Listening...</Text>
      </View>
    );
  }

  if (status === 'processing') {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#5B7FFF" />
        <View style={styles.processingRow}>
          <Text style={styles.processingText}>Processing your request</Text>
          {renderProcessingDots()}
        </View>
        <Text style={styles.processingSubText}>AI is thinking, please wait...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  }

  if (status === 'response' && response) {
    return (
      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.contentContainer}>
        <Text style={styles.responseText}>{response.text}</Text>
      </ScrollView>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  scrollContainer: {
    flex: 1,
    width: '100%',
  },
  contentContainer: {
    padding: 20,
    paddingTop: 10,
  },
  idleText: {
    fontSize: 18,
    color: '#8E8E93',
    textAlign: 'center',
  },
  recordingText: {
    fontSize: 20,
    color: '#FF5B5B',
    fontWeight: '500',
  },
  processingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
  },
  processingText: {
    fontSize: 18,
    color: '#5B7FFF',
    fontWeight: '600',
  },
  processingDots: {
    fontSize: 22,
    color: '#5B7FFF',
    marginLeft: 2,
    fontWeight: '900',
  },
  processingSubText: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 8,
    fontStyle: 'italic',
  },
  responseText: {
    fontSize: 18,
    color: '#333',
    lineHeight: 26,
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
  },
});