import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import MyMealsScreen from '../app/(tabs)/mymeals';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn(),
}));

const mockReplace = jest.fn();
const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
  }),
}));

jest.mock('@expo/vector-icons', () => ({
  Ionicons: jest.fn(() => null),
}));

// Mock fetch API globally
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () =>
      Promise.resolve({
        recipes: [
          { name: 'Recipe 1', ingredients: ['Ingredient 1'], instructions: ['Instruction 1'], source: 'Source 1' },
          { name: 'Recipe 2', ingredients: ['Ingredient 2'], instructions: ['Instruction 2'], source: 'Source 2' },
        ],
      }),
  })
);

describe('MyMealsScreen', () => {
  beforeEach(() => {
    (AsyncStorage.getItem as jest.Mock).mockImplementation((key) => {
      if (key === 'likedRecipes') {
        return Promise.resolve(
          JSON.stringify([
            { title: 'Recipe 1', ingredients: ['Ingredient 1'], instructions: ['Instruction 1'], source: 'Source 1' },
            { title: 'Recipe 2', ingredients: ['Ingredient 2'], instructions: ['Instruction 2'], source: 'Source 2' },
          ])
        );
      }
      return Promise.resolve(null);
    });

    (AsyncStorage.setItem as jest.Mock).mockClear();
    (AsyncStorage.clear as jest.Mock).mockClear();
    mockReplace.mockClear();
    mockPush.mockClear();
    (global.fetch as jest.Mock).mockClear();
  });

  const renderWithNavigation = (component: React.ReactElement) => {
    return render(<NavigationContainer>{component}</NavigationContainer>);
  };

  // UT26 – FR14: Renders loading state initially
  it('renders loading state initially', () => {
    const { getByText, getByTestId } = renderWithNavigation(<MyMealsScreen />);
    expect(getByTestId('loading-indicator')).toBeTruthy();
    expect(getByText('Loading saved recipes...')).toBeTruthy();
  });

  // UT27 – FR14: Loads saved recipes from AsyncStorage
  it('loads saved recipes from AsyncStorage', async () => {
    const { getByText } = renderWithNavigation(<MyMealsScreen />);
    await waitFor(() => expect(getByText('Recipe 1')).toBeTruthy());
    await waitFor(() => expect(getByText('Recipe 2')).toBeTruthy());
  });

  // UT28 – FR14: Filters recipes based on search query
  it('filters recipes based on search query', async () => {
    const { getByText, getByPlaceholderText } = renderWithNavigation(<MyMealsScreen />);
    await waitFor(() => expect(getByText('Recipe 1')).toBeTruthy());
    await waitFor(() => expect(getByText('Recipe 2')).toBeTruthy());

    fireEvent.changeText(getByPlaceholderText('Search recipes or ingredients'), 'Recipe 1');
    await waitFor(() => expect(getByText('Recipe 1')).toBeTruthy());
    expect(() => getByText('Recipe 2')).toThrow();
  });

  // UT29 – FR15: Removes a recipe
  it('removes a recipe', async () => {
    const { getByText, getAllByTestId } = renderWithNavigation(<MyMealsScreen />);

    // Wait for the recipes to load and render
    await waitFor(() => expect(getByText('Recipe 1')).toBeTruthy());
    await waitFor(() => expect(getByText('Recipe 2')).toBeTruthy());

    // Simulate pressing the "Remove" button for the first recipe
    fireEvent.press(getAllByTestId('remove-button')[0]);

    // Verify that "Recipe 1" is removed from the screen
    await waitFor(() => expect(() => getByText('Recipe 1')).toThrow());
    expect(getByText('Recipe 2')).toBeTruthy();
  });

  // UT30 – FR19: Updates ratings for a recipe
  it('updates ratings for a recipe', async () => {
    const { getByText, getAllByTestId } = renderWithNavigation(<MyMealsScreen />);

    // Wait for the recipes to load and render
    await waitFor(() => expect(getByText('Recipe 1')).toBeTruthy());
    await waitFor(() => expect(getByText('Recipe 2')).toBeTruthy());

    // Simulate rating the first recipe
    const starRatingComponent = getAllByTestId('star-rating-widget')[0]; // Assuming the StarRating component has a testID
    fireEvent(starRatingComponent, 'onChange', 4); // Simulate giving a 4-star rating

    // Verify that the rating is updated in AsyncStorage
    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'recipeRatings',
        JSON.stringify({ 'Recipe 1': 4 })
      );
    });
  });

});