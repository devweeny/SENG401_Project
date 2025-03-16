import { useState, useEffect } from 'react';
import { Stack } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React from 'react';

export default function RootLayout() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const loggedIn = await AsyncStorage.getItem('loggedIn');
        setIsAuthenticated(loggedIn === 'true');
      } catch (error) {
        console.error("Error in _layout.tsx checkLogin:", error);
        setIsAuthenticated(false);
      }
    };
    
    checkLogin();
  }, []);

  if (isAuthenticated === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#FF6B6B" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ 
      headerShown: false,
      animation: 'none',
      gestureEnabled: false
    }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="ClearStorage" />
      
      {/* The (tabs) group will handle the tab navigation */}
      {isAuthenticated && <Stack.Screen name="(tabs)" options={{ headerShown: false }} />}
    </Stack>
  );
}