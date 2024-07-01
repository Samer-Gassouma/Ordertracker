import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, Image } from 'react-native';
import logo from '../assets/images/Logo1.png';
import { router  } from 'expo-router';

export default function SplashScreen101() {
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 1000, 
      useNativeDriver: true,
    }).start(() => {
      router.replace('(tabs)');
    });
  }, []);

  return (
    <View style={styles.container}>
      <Animated.Image 
        source={logo} 
        style={[styles.logo, { opacity: fadeAnim }]} 
        resizeMode="contain" 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f4761', 
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 300, 
    height: 300,
  },
});
