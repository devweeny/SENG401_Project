import { Redirect } from 'expo-router';
import React from 'react';

export default function TabIndex() {
  // Redirect to the ingredients tab
  return <Redirect href="/(tabs)/ingredients" />;
}