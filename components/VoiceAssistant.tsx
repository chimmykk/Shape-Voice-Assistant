import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { RecordButton } from './RecordButton';
import { ResponseDisplay } from './ResponseDisplay';
import { useVoiceStore } from '@/store/voiceStore';
import { RefreshCw } from 'lucide-react-native';

export const VoiceAssistant = () => {
  const { status, reset } = useVoiceStore();
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Voice Assistant</Text>
        {status === 'response' && (
          <TouchableOpacity onPress={reset} style={styles.resetButton}>
            <RefreshCw size={20} color="#5B7FFF" />
          </TouchableOpacity>
        )}
      </View>
      
      <View style={styles.responseContainer}>
        <ResponseDisplay />
      </View>
      
      <View style={styles.controlsContainer}>
        <RecordButton />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: '#333',
  },
  resetButton: {
    padding: 8,
  },
  responseContainer: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  controlsContainer: {
    paddingBottom: 40,
    alignItems: 'center',
  },
});