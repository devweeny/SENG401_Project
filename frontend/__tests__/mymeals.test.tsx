import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import MyMealsScreen from '../app/(tabs)/mymeals';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

jest.mock('@react-native-async-storage/async-storage', () => ({
    getItem: jest.fn(),
    setItem: jest.fn(),
  }));
jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
  },
}));

jest.mock('@expo/vector-icons', () => ({
    Ionicons: jest.fn(() => null),
  }));

describe('MyMealsScreen', () => {
  beforeEach(() => {
    (AsyncStorage.getItem as jest.Mock).mockClear();
    (AsyncStorage.setItem as jest.Mock).mockClear();
    (router.push as jest.Mock).mockClear();
  });

  it('renders loading state initially', () => {
    const { getByText, getByTestId } = render(<MyMealsScreen />);
    expect(getByTestId('loading-indicator')).toBeTruthy();
    expect(getByText('Loading saved recipes...')).toBeTruthy();
  });

  it('loads saved recipes from AsyncStorage', async () => {
    const mockRecipes = [
      { title: 'Recipe 1', ingredients: ['Ingredient 1'], instructions: ['Instruction 1'], source: 'Source 1' },
      { title: 'Recipe 2', ingredients: ['Ingredient 2'], instructions: ['Instruction 2'], source: 'Source 2' },
    ];
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify(mockRecipes));

    const { getByText } = render(<MyMealsScreen />);
    await waitFor(() => expect(getByText('Recipe 1')).toBeTruthy());
    await waitFor(() => expect(getByText('Recipe 2')).toBeTruthy());
  });

  it('filters recipes based on search query', async () => {
    const mockRecipes = [
      { title: 'Recipe 1', ingredients: ['Ingredient 1'], instructions: ['Instruction 1'], source: 'Source 1' },
      { title: 'Recipe 2', ingredients: ['Ingredient 2'], instructions: ['Instruction 2'], source: 'Source 2' },
    ];
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify(mockRecipes));

    const { getByText, getByPlaceholderText } = render(<MyMealsScreen />);
    await waitFor(() => expect(getByText('Recipe 1')).toBeTruthy());
    await waitFor(() => expect(getByText('Recipe 2')).toBeTruthy());

    fireEvent.changeText(getByPlaceholderText('Search recipes or ingredients'), 'Recipe 1');
    await waitFor(() => expect(getByText('Recipe 1')).toBeTruthy());
    expect(() => getByText('Recipe 2')).toThrow();
  });

  it('removes a recipe', async () => {
    const mockRecipes = [
      { title: 'Recipe 1', ingredients: ['Ingredient 1'], instructions: ['Instruction 1'], source: 'Source 1' },
      { title: 'Recipe 2', ingredients: ['Ingredient 2'], instructions: ['Instruction 2'], source: 'Source 2' },
    ];
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify(mockRecipes));

    const { getByText, getAllByTestId } = render(<MyMealsScreen />);
    await waitFor(() => expect(getByText('Recipe 1')).toBeTruthy());
    await waitFor(() => expect(getByText('Recipe 2')).toBeTruthy());

    fireEvent.press(getAllByTestId('remove-button')[0]);
    await waitFor(() => expect(() => getByText('Recipe 1')).toThrow());
    expect(getByText('Recipe 2')).toBeTruthy();
  });

  it('navigates to find recipes screen', async () => {
    const { getByText } = render(<MyMealsScreen />);
    await waitFor(() => expect(getByText('Find Recipes')).toBeTruthy());
    fireEvent.press(getByText('Find Recipes'));
    expect(router.push).toHaveBeenCalledWith('/(tabs)/ingredients');
  });

  it('renders and loads saved recipes', async () => {
    const { getByText } = render(<MyMealsScreen />);

    // Wrap state updates in act
    await waitFor(() => {
      expect(getByText("Your Saved Recipes")).toBeTruthy();
    });
  });
});