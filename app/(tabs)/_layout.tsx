import { Tabs } from 'expo-router';
import React from 'react';
import i18n from '../i18n';
import * as Icons from "react-native-heroicons/outline";
import * as Haptics from 'expo-haptics';

import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        //tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
      }}
      screenListeners={{
        tabPress: (e) => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
        }
      }}
    >
      <Tabs.Screen
        name="index"
        
        options={{
          title: i18n.t('delivery'),
          tabBarIcon: ({ color, focused }) => (
            <Icons.MapPinIcon    color={color}  focusable={focused} />

          ),
          
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: i18n.t('profile'),
          tabBarIcon: ({ color, focused }) => (
            <Icons.FaceSmileIcon    color={color}  focusable={focused} />
          ),
        }}
      />
    </Tabs>
  );
}
