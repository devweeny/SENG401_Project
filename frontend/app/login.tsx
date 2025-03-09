import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const formData = new FormData();
      formData.append('email', email);
      formData.append('password', password);

      const response = await fetch('https://ensf400.devweeny.ca/login', {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
        },
      });

      const data = await response.json();

      console.log(data);

      if (response.ok) {
        await AsyncStorage.setItem('loggedIn', 'true');
        await AsyncStorage.setItem('user', JSON.stringify(data));
        Alert.alert('Success', 'Logged in!');
        router.replace('/');
      } else {
        Alert.alert('Error', data.message || 'Login failed');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Network error occurred');
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text>Email:</Text>
      <TextInput
        style={{ borderWidth: 1, padding: 10, marginVertical: 10 }}
        placeholder="Enter email"
        value={email}
        onChangeText={setEmail}
      />
      <Text>Password:</Text>
      <TextInput
        style={{ borderWidth: 1, padding: 10, marginVertical: 10 }}
        placeholder="Enter password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Button title="Login" onPress={handleLogin} />
      <Button title="Register" onPress={() => router.push('/register')} />
    </View>
  );
}
