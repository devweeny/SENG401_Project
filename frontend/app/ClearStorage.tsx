import React from 'react';
import { View, Button, Text, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

export default function ClearStorage() {
  const router = useRouter();
  
  const clearStorage = async () => {
    try {
      await AsyncStorage.clear();
      alert('Storage cleared! App will restart');
      router.replace('/');
    } catch (e) {
      console.error(e);
      alert('Failed to clear storage');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Debug Tools</Text>
      <Button title="Clear Storage & Reset App" onPress={clearStorage} />
      <Button title="Go Back" onPress={() => router.back()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});