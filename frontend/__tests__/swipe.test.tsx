import React from "react";
import { render, fireEvent, waitFor, act } from "@testing-library/react-native";
import SwipeScreen from "../app/(tabs)/swipe";
import { Alert } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';

jest.spyOn(Alert, "alert");

const mockPush = jest.fn();
const mockReplace = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
  }),
}));

jest.mock("@react-native-async-storage/async-storage", () => ({
  setItem: jest.fn(),
  getItem: jest.fn((key) => {
    if (key === 'likedRecipes') {
      return Promise.resolve(JSON.stringify([]));
    }
    return Promise.resolve(JSON.stringify([{ title: "Test Recipe", ingredients: ["Ingredient 1"], instructions: ["Step 1"], source: "Test Source" }]));
  }),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

jest.mock('@expo/vector-icons', () => ({
  Ionicons: jest.fn(() => null),
}));

describe("SwipeScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    AsyncStorage.clear();
  });

  // UT15 – FR12: Swipe Right to Save Recipe
  it("Swipe right saves recipe", async () => {
    const { getByText, findByText } = render(<SwipeScreen />);
    const saveButton = await findByText("Save");
    fireEvent.press(saveButton);
  
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        "Saved",
        "Recipe added to favorites."
      );
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'likedRecipes',
        JSON.stringify([{ title: "Test Recipe", ingredients: ["Ingredient 1"], instructions: ["Step 1"], source: "Test Source" }])
      );
    });
  });

  // UT16 – FR13: Swipe Left to Discard Recipe
  it("Swipe left discards recipe", async () => {
    const { getByText, findByText } = render(<SwipeScreen />);
    await waitFor(() => findByText("Skip"));
    fireEvent.press(getByText("Skip"));
  
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        "Discarded",
        "Recipe removed."
      );
    });
  });

  // UT17 – FR14: View Favorites
  it("View Favorites", async () => {
    const { getByText, findByText } = render(<SwipeScreen />);
    const savedButton = await findByText("Saved (0)");
    fireEvent.press(savedButton);
  
    expect(mockPush).toHaveBeenCalledWith('/(tabs)/mymeals');
  });

  // UT18 – FR15: Remove from Favorites
  it("Remove from Favorites", async () => {
    const { getByText, findByText } = render(<SwipeScreen />);
    const removeButton = await findByText("Remove"); // Use findByText directly
    fireEvent.press(removeButton);
  
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        "Removed",
        "Recipe deleted from favorites."
      );
    });
  });
});
