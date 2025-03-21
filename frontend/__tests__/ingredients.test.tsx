import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import IngredientsScreen from '../app/(tabs)/ingredients';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { Alert } from 'react-native';
import { mock } from 'node:test';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

const mockPush = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockPush, // Add replace to the mock
  }),
}));


jest.mock('@expo/vector-icons', () => ({
  Ionicons: jest.fn(() => null),
}));

jest.spyOn(Alert, 'alert').mockImplementation(jest.fn());

describe('IngredientsScreen', () => {
  // UT38 – FR7: Renders the screen correctly
  it('renders correctly', () => {
    const { getByPlaceholderText, getByText } = render(<IngredientsScreen />);
    expect(getByPlaceholderText('Enter ingredients (comma separated)')).toBeTruthy();
    expect(getByPlaceholderText('Search for a recipe')).toBeTruthy();
    expect(getByText('Find Recipes')).toBeTruthy();
  });

  // UT39 – FR7: Shows alert if no ingredients or recipe name is entered
  it('shows alert if no ingredients or recipe name is entered', async () => {
    const { getByText } = render(<IngredientsScreen />);
    fireEvent.press(getByText('Find Recipes'));
    await waitFor(() => expect(Alert.alert).toHaveBeenCalledWith('Please enter ingredients or a recipe name'));
  });

  // UT40 – FR11: Generates recipes for guest user
  it('generates recipes for guest user', async () => {
    AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify({ guest: true }));

    const { getByText, getByPlaceholderText } = render(<IngredientsScreen />);
    fireEvent.changeText(getByPlaceholderText('Enter ingredients (comma separated)'), 'yogurt, honey');
    fireEvent.press(getByText('Find Recipes'));

    await waitFor(() => expect(AsyncStorage.setItem).toHaveBeenCalledWith('generatedRecipes', expect.any(String)));
    expect(mockPush).toHaveBeenCalledWith('/(tabs)/swipe');
  });

  // UT41 – FR11: Generates recipes for logged-in user
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
    expect(mockPush).toHaveBeenCalledWith('/(tabs)/swipe');
  });

  // UT42 – FR11: Handles API error and falls back to mock data
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
    expect(mockPush).toHaveBeenCalledWith('/(tabs)/swipe');
  });

  // UT43 – FR11: Displays loading indicator while fetching recipes
  it('displays loading indicator while fetching recipes', async () => {
    AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify({ guest: true }));

    const { getByText, getByPlaceholderText, getByTestId } = render(<IngredientsScreen />);
    fireEvent.changeText(getByPlaceholderText('Enter ingredients (comma separated)'), 'yogurt, honey');
    fireEvent.press(getByText('Find Recipes'));

    expect(getByTestId('loading-indicator')).toBeTruthy();
    await waitFor(() => expect(AsyncStorage.setItem).toHaveBeenCalledWith('generatedRecipes', expect.any(String)));
    expect(mockPush).toHaveBeenCalledWith('/(tabs)/swipe');
  });
});

describe('IngredientsScreen - handleFindRecipes', () => {
  // UT44 – FR7: Shows alert if both ingredients and recipe name are empty
  it('shows alert if both ingredients and recipe name are empty', async () => {
    const { getByText } = render(<IngredientsScreen />);
    fireEvent.press(getByText('Find Recipes'));
    await waitFor(() => expect(Alert.alert).toHaveBeenCalledWith('Please enter ingredients or a recipe name'));
  });

  // UT45 – FR7: Calls generateRecipe with ingredients when provided
  it('calls generateRecipe with ingredients when provided', async () => {
    AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify({ guest: true }));

    const { getByText, getByPlaceholderText } = render(<IngredientsScreen />);
    fireEvent.changeText(getByPlaceholderText('Enter ingredients (comma separated)'), 'chicken, rice');
    fireEvent.press(getByText('Find Recipes'));

    await waitFor(() => expect(AsyncStorage.setItem).toHaveBeenCalledWith('generatedRecipes', expect.any(String)));
    expect(mockPush).toHaveBeenCalledWith('/(tabs)/swipe');
  });

  // UT46 – FR9: Calls generateRecipe with recipe name when ingredients are empty
  it('calls generateRecipe with recipe name when ingredients are empty', async () => {
    AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify({ guest: true }));

    const { getByText, getByPlaceholderText } = render(<IngredientsScreen />);
    fireEvent.changeText(getByPlaceholderText('Search for a recipe'), 'pasta');
    fireEvent.press(getByText('Find Recipes'));

    await waitFor(() => expect(AsyncStorage.setItem).toHaveBeenCalledWith('generatedRecipes', expect.any(String)));
    expect(mockPush).toHaveBeenCalledWith('/(tabs)/swipe');
  });

  // UT47 – FR11: Handles API error and shows fallback recipes
  it('handles API error and shows fallback recipes', async () => {
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
    expect(mockPush).toHaveBeenCalledWith('/(tabs)/swipe');
  });

  // UT48 – FR11: Displays loading indicator while fetching recipes
  it('displays loading indicator while fetching recipes', async () => {
    AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify({ guest: true }));

    const { getByText, getByPlaceholderText, getByTestId } = render(<IngredientsScreen />);
    fireEvent.changeText(getByPlaceholderText('Enter ingredients (comma separated)'), 'yogurt, honey');
    fireEvent.press(getByText('Find Recipes'));

    expect(getByTestId('loading-indicator')).toBeTruthy();
    await waitFor(() => expect(AsyncStorage.setItem).toHaveBeenCalledWith('generatedRecipes', expect.any(String)));
    expect(mockPush).toHaveBeenCalledWith('/(tabs)/swipe');
  });
});