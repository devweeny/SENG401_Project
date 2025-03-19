import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import IngredientsScreen from '../app/(tabs)/ingredients';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { Alert } from 'react-native';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
  },
}));

jest.mock('@expo/vector-icons', () => ({
  Ionicons: jest.fn(() => null),
}));

jest.spyOn(Alert, 'alert');

describe('IngredientsScreen', () => {
  beforeEach(() => {
    AsyncStorage.getItem.mockClear();
    AsyncStorage.setItem.mockClear();
    AsyncStorage.removeItem.mockClear();
    router.push.mockClear();
    Alert.alert.mockClear();
  });

  it('renders correctly', () => {
    const { getByPlaceholderText, getByText } = render(<IngredientsScreen />);
    expect(getByPlaceholderText('Enter ingredients (comma separated)')).toBeTruthy();
    expect(getByPlaceholderText('Search for a recipe')).toBeTruthy();
    expect(getByText('Find Recipes')).toBeTruthy();
  });

  it('shows alert if no ingredients or recipe name is entered', async () => {
    const { getByText } = render(<IngredientsScreen />);
    fireEvent.press(getByText('Find Recipes'));
    await waitFor(() => expect(Alert.alert).toHaveBeenCalledWith('Please enter ingredients or a recipe name'));
  });

  it('generates recipes for guest user', async () => {
    AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify({ guest: true }));

    const { getByText, getByPlaceholderText } = render(<IngredientsScreen />);
    fireEvent.changeText(getByPlaceholderText('Enter ingredients (comma separated)'), 'yogurt, honey');
    fireEvent.press(getByText('Find Recipes'));

    await waitFor(() => expect(AsyncStorage.setItem).toHaveBeenCalledWith('generatedRecipes', expect.any(String)));
    expect(router.push).toHaveBeenCalledWith('/(tabs)/swipe');
  });

  it('generates recipes for logged in user', async () => {
    AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify({ guest: false }));
    AsyncStorage.getItem.mockResolvedValueOnce('"mockToken"');

    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ recipe: [{ title: 'Mock Recipe' }] }),
      })
    );

    const { getByText, getByPlaceholderText } = render(<IngredientsScreen />);
    fireEvent.changeText(getByPlaceholderText('Enter ingredients (comma separated)'), 'yogurt, honey');
    fireEvent.press(getByText('Find Recipes'));

    await waitFor(() => expect(AsyncStorage.setItem).toHaveBeenCalledWith('generatedRecipes', expect.any(String)));
    expect(router.push).toHaveBeenCalledWith('/(tabs)/swipe');
  });

  it('handles API error and falls back to mock data', async () => {
    AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify({ guest: false }));
    AsyncStorage.getItem.mockResolvedValueOnce('"mockToken"');

    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      })
    );

    const { getByText, getByPlaceholderText } = render(<IngredientsScreen />);
    fireEvent.changeText(getByPlaceholderText('Enter ingredients (comma separated)'), 'yogurt, honey');
    fireEvent.press(getByText('Find Recipes'));

    await waitFor(() => expect(AsyncStorage.setItem).toHaveBeenCalledWith('generatedRecipes', expect.any(String)));
    expect(router.push).toHaveBeenCalledWith('/(tabs)/swipe');
  });

  it('displays loading indicator while fetching recipes', async () => {
    AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify({ guest: true }));

    const { getByText, getByPlaceholderText, getByTestId } = render(<IngredientsScreen />);
    fireEvent.changeText(getByPlaceholderText('Enter ingredients (comma separated)'), 'yogurt, honey');
    fireEvent.press(getByText('Find Recipes'));

    expect(getByTestId('loading-indicator')).toBeTruthy();
    await waitFor(() => expect(AsyncStorage.setItem).toHaveBeenCalledWith('generatedRecipes', expect.any(String)));
    expect(router.push).toHaveBeenCalledWith('/(tabs)/swipe');
  });
});