import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  Image
} from 'react-native';
import * as Speech from 'expo-speech';
import Constants from 'expo-constants';
import ChatBubble from '../components/ChatBubble';
import ChatInput from '../components/ChatInput';

const generateId = () => Math.random().toString(36).substring(2, 9);
const getTime = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

// Dynamically determine the host IP (handles LAN, Tunnel, and Proxy modes)
const getApiUrl = () => {
  const hostUri = Constants.expoConfig?.hostUri;
  const host = hostUri?.split(':')[0];

  if (!host || host.includes('ngrok') || host.includes('exp.direct') || host.includes('expo.proxy')) {
    // If in tunnel mode (exp.direct), we MUST use the LAN IP for the backend fetch
    return 'http://10.121.59.40:5000/api/chat';
  }
  return `http://${host}:5000/api/chat`;
};

const API_URL = getApiUrl();

export default function ChatScreen() {
  const [messages, setMessages] = useState([
    {
      id: generateId(),
      text: "Greetings! I'm your AI Retail Intelligence Assistant. I have successfully audited your inventory and sales performance. How can I assist you today?",
      sender: 'bot',
      type: 'text',
      time: getTime()
    }
  ]);
  const [chatHistory, setChatHistory] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef(null);

  const performChat = (text) => {
    if (text.trim() === '') return;

    const userMessageText = text.trim();
    const newUserMessage = {
      id: generateId(),
      text: userMessageText,
      sender: 'user',
      type: 'text',
      time: getTime()
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setInputText('');
    setIsTyping(true);

    fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: userMessageText, history: chatHistory.slice(-5) }),
    })
      .then((response) => response.json())
      .then((data) => {
        const botResponse = {
          ...data,
          id: generateId(),
          sender: 'bot',
          time: getTime(),
        };
        setMessages((prev) => [...prev, botResponse]);
        setChatHistory((prev) => [...prev, { role: 'user', content: userMessageText }, { role: 'assistant', content: data.text || "Report generated." }].slice(-10));
        setIsTyping(false);
      })
      .catch((error) => {
        console.error('Network Error:', error);
        setIsTyping(false);
      });
  };

  const handleSend = () => performChat(inputText);
  const handleVoiceCommand = (transcript) => performChat(transcript);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages, isTyping]);

  return (
    <View style={styles.safeArea}>
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Image
            source={require('../assets/images/logo.png')}
            style={{ width: 32, height: 32, borderRadius: 8 }}
          />
          <View>
            <Text style={styles.headerTitle}>Retail Hub AI</Text>
            <View style={styles.statusRow}>
              <View style={styles.statusDot} />
              <Text style={styles.headerSubtitle}>System Active • Enterprise Core</Text>
            </View>
          </View>
        </View>
        <View style={styles.headerIcons}>
          <View style={styles.headerBadge}>
            <Text style={styles.badgeText}>v2.4</Text>
          </View>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => <ChatBubble message={item} />}
          ListFooterComponent={
            isTyping ? (
              <View style={styles.typingContainer}>
                <View style={styles.typingIndicator}>
                  <View style={styles.dot} />
                  <View style={[styles.dot, { opacity: 0.6 }]} />
                  <View style={[styles.dot, { opacity: 0.3 }]} />
                </View>
                <Text style={styles.typingText}>Analyzing enterprise data...</Text>
              </View>
            ) : null
          }
        />

        <ChatInput
          value={inputText}
          onChangeText={setInputText}
          onSend={handleSend}
          onVoiceCommand={handleVoiceCommand}
        />
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F0F2F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: '#E1E5EA',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1A1D1F',
    letterSpacing: -0.5,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4CAF50',
    marginRight: 6,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#6F767E',
    fontWeight: '600',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerBadge: {
    backgroundColor: '#F4F4F4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1A1D1F',
  },
  container: {
    flex: 1,
  },
  listContent: {
    paddingVertical: 20,
    paddingBottom: 40,
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 20,
    marginTop: 10,
    gap: 8,
  },
  typingIndicator: {
    flexDirection: 'row',
    gap: 3,
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#0B93F6',
  },
  typingText: {
    color: '#6F767E',
    fontSize: 12,
    fontWeight: '500',
  },
});
