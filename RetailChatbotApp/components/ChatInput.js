import React, { useState, useRef, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Animated, Easing, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import Constants from 'expo-constants';

const VoiceWave = () => {
  const anim1 = useRef(new Animated.Value(2)).current;
  const anim2 = useRef(new Animated.Value(2)).current;
  const anim3 = useRef(new Animated.Value(2)).current;
  const anim4 = useRef(new Animated.Value(2)).current;

  const animate = (anim, duration) => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 12, duration, easing: Easing.bezier(0.4, 0, 0.2, 1), useNativeDriver: false }),
        Animated.timing(anim, { toValue: 2, duration, easing: Easing.bezier(0.4, 0, 0.2, 1), useNativeDriver: false }),
      ])
    ).start();
  };

  useEffect(() => {
    animate(anim1, 350);
    animate(anim2, 500);
    animate(anim3, 300);
    animate(anim4, 450);
  }, []);

  return (
    <View style={styles.waveContainer}>
      <Animated.View style={[styles.waveBar, { height: anim1 }]} />
      <Animated.View style={[styles.waveBar, { height: anim2, marginHorizontal: 2 }]} />
      <Animated.View style={[styles.waveBar, { height: anim3, marginHorizontal: 2 }]} />
      <Animated.View style={[styles.waveBar, { height: anim4 }]} />
    </View>
  );
};

export default function ChatInput({ value, onChangeText, onSend, onVoiceCommand }) {
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState(null);

  const getTranscribeUrl = () => {
    const hostUri = Constants.expoConfig?.hostUri;
    const host = hostUri?.split(':')[0];
    if (!host || host.includes('ngrok') || host.includes('exp.direct') || host.includes('expo.proxy')) {
      return 'http://10.136.13.48:5000/api/transcribe';
    }
    return `http://${host}:5000/api/transcribe`;
  };

  async function startRecording() {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== 'granted') return;

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      setIsRecording(true);
    } catch (err) {
      console.error('[VOICE] Recording Error:', err);
    }
  }

  async function stopRecording() {
    setIsRecording(false);
    setRecording(undefined);
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    transcribeAudio(uri);
  }

  async function transcribeAudio(uri) {
    try {
      const formData = new FormData();
      formData.append('audio', {
        uri: Platform.OS === 'android' ? uri : uri.replace('file://', ''),
        type: 'audio/m4a',
        name: 'speech.m4a',
      });

      const response = await fetch(getTranscribeUrl(), {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const data = await response.json();
      if (data.text) {
        if (onVoiceCommand) onVoiceCommand(data.text);
      } else {
        alert(data.error || 'Speech processing failed');
      }
    } catch (error) {
      console.error('[VOICE] Upload Failed:', error);
      alert('Backend transcription service not reachable');
    }
  }

  async function handleMicPress() {
    if (isRecording) {
      await stopRecording();
    } else {
      await startRecording();
    }
  }

  return (
    <View style={styles.outerContainer}>
      <View style={styles.container}>
        <TouchableOpacity
          style={[styles.micButton, isRecording && styles.micButtonActive]}
          onPress={handleMicPress}
          activeOpacity={0.7}
        >
          {isRecording ? <VoiceWave /> : <Ionicons name="mic-sharp" size={20} color={isRecording ? "#fff" : "#6F767E"} />}
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          placeholder={isRecording ? "Listening..." : "Message Retail Hub..."}
          placeholderTextColor="#9A9A9A"
          value={value}
          onChangeText={onChangeText}
          multiline
          maxHeight={100}
        />

        {value.trim().length > 0 && (
          <TouchableOpacity
            style={styles.sendButton}
            onPress={onSend}
          >
            <Ionicons name="arrow-up" size={22} color="#fff" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    paddingHorizontal: 16,
    paddingBottom: 30,
    backgroundColor: 'transparent',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 28,
    padding: 6,
    paddingRight: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F1F3F5',
  },
  micButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F4F4F4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  micButtonActive: {
    backgroundColor: '#0B93F6',
  },
  waveContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  waveBar: {
    width: 2,
    backgroundColor: '#fff',
    borderRadius: 1,
  },
  input: {
    flex: 1,
    minHeight: 44,
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 12,
    fontSize: 15,
    fontWeight: '500',
    color: '#1A1D1F',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0B93F6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0B93F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
});
