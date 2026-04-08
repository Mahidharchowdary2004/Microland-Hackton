import { Tabs } from 'expo-router';
import React from 'react';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarStyle: { display: 'none' }, // Set to none to hide the bottom tabs and give full screen to Chat
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Chat UI',
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          href: null, // Hides it completely
        }}
      />
    </Tabs>
  );
}
