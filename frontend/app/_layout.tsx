import { useState, useEffect } from 'react';
import { Stack } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React from 'react';

export default function RootLayout() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkLogin = async () => {
      const loggedIn = await AsyncStorage.getItem('loggedIn');
      setIsAuthenticated(loggedIn === 'true');
    };
    checkLogin();
  }, []);

  if (isAuthenticated === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ 
      headerShown: false,              // Hide all headers
      animation: 'none',               // Disable animations between screens
      gestureEnabled: false            // Disable swipe back gesture
    }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="ingredients" />
      <Stack.Screen name="swipe" />
      <Stack.Screen name="mymeals" />
    </Stack>
  );
}