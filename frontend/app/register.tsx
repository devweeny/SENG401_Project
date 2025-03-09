import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

export default function RegisterScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async () => {
    if (!email || !password || !name) {
      Alert.alert('Error', 'Please enter email, name and password.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('email', email);
      formData.append('name', name);
      formData.append('password', password);

      const response = await fetch('https://ensf400.devweeny.ca/register', {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
        },
      });

      const data = await response.json();
      console.log(data);
      if (response.ok) {
        await AsyncStorage.setItem('user', JSON.stringify(data));
        Alert.alert('Success', 'Account created! You can now log in.');
        router.push('/login');
      } else {
        Alert.alert('Error', data.message || 'Registration failed');
      }
    } catch (error: unknown) {
      console.error(error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Network error occurred');
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
      <Text>Name:</Text>
      <TextInput
        style={{ borderWidth: 1, padding: 10, marginVertical: 10 }}
        placeholder="Enter name"
        value={name}
        onChangeText={setName}
      />
      <Text>Password:</Text>
      <TextInput
        style={{ borderWidth: 1, padding: 10, marginVertical: 10 }}
        placeholder="Enter password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Button title="Register" onPress={handleRegister} />
    </View>
  );
}
