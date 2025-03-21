import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import SwipeScreen from "../app/(tabs)/swipe";
import { Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NavigationContainer } from "@react-navigation/native";

jest.spyOn(Alert, "alert");
jest.spyOn(console, "log").mockImplementation(() => {});

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
    if (key === "likedRecipes") {
      return Promise.resolve(JSON.stringify([]));
    }
    return Promise.resolve(
      JSON.stringify([
        {
          title: "Test Recipe",
          ingredients: ["Ingredient 1"],
          instructions: ["Step 1"],
          source: "Test Source",
        },
      ])
    );
  }),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

jest.mock("@expo/vector-icons", () => ({
  Ionicons: jest.fn(() => null),
}));

describe("SwipeScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    AsyncStorage.clear();
  });

  const renderWithNavigation = (component: React.ReactNode) => {
    return render(<NavigationContainer>{component}</NavigationContainer>);
  };

  // UT01 – FR12: Swipe Right to Save Recipe
  it("Saves a recipe by swiping right", async () => {
    const { findByText } = renderWithNavigation(<SwipeScreen />);
    const saveButton = await findByText("Save");
  
    // Simulate pressing the "Save" button
    fireEvent.press(saveButton);
  
    // Verify that the recipe is saved
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        "Saved",
        "Recipe added to favorites."
      );
    });
  });

  // UT02 – FR13: Swipe Left to Discard Recipe
  it("Discards a recipe by swiping left", async () => {
    const { findByText } = renderWithNavigation(<SwipeScreen />);
    const skipButton = await findByText("Skip");

    // Simulate pressing the "Skip" button
    fireEvent.press(skipButton);

    // Verify that the recipe is discarded
    await waitFor(() => {
      expect(console.log).toHaveBeenCalledWith("Recipe discarded:", "Test Recipe");
    });
  });

  // UT03 – FR14: View Favorites
  it("Navigates to the favorites screen", async () => {
    const { findByText } = renderWithNavigation(<SwipeScreen />);
    const savedButton = await findByText("Saved (0)");

    // Simulate pressing the "Saved" button
    fireEvent.press(savedButton);

    // Verify navigation to the favorites screen
    expect(mockPush).toHaveBeenCalledWith("/(tabs)/mymeals");
  });

  // UT04 – FR15: No "Remove from Favorites" functionality
  it("Does not have a 'Remove from Favorites' button", async () => {
    const { queryByText } = renderWithNavigation(<SwipeScreen />);

    // Verify that the "Remove" button does not exist
    const removeButton = queryByText("Remove");
    expect(removeButton).toBeNull();
  });

  // UT05 – FR11: Loading State
  it("Displays loading indicator while recipes are being loaded", async () => {
    AsyncStorage.getItem.mockImplementationOnce(() => new Promise(() => {})); // Simulate loading state
    const { getByText } = renderWithNavigation(<SwipeScreen />);
    expect(getByText("Loading recipes...")).toBeTruthy();
  });

  // UT06 – FR11: No Recipes Available
  it("Displays 'No more recipes' message when no recipes are available", async () => {
    AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify([])); // No recipes
    const { findByText } = renderWithNavigation(<SwipeScreen />);
    expect(await findByText("No more recipes!")).toBeTruthy();
  });

  // UT07 – FR12: Swipe Right with No Token
  it("Handles swipe right gracefully when no token is available", async () => {
    AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify([{ title: "Test Recipe", ingredients: [], instructions: [], source: "" }]));
    AsyncStorage.getItem.mockResolvedValueOnce(null); // No token
    const { findByText } = renderWithNavigation(<SwipeScreen />);
    const saveButton = await findByText("Save");

    fireEvent.press(saveButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith("Saved", "Recipe added to favorites.");
    });
  });

  // UT08 – FR11: Error During Recipe Loading
  it("Handles error during recipe loading", async () => {
    AsyncStorage.getItem.mockImplementation(() => {
      throw new Error("Error loading recipes");
    });
    const { findByText } = renderWithNavigation(<SwipeScreen />);
    expect(await findByText("No more recipes!")).toBeTruthy();
  });

  // UT09 – FR12: Swipe Right Animation
  it("Triggers swipe right animation", async () => {
    AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify([{ title: "Test Recipe", ingredients: [], instructions: [], source: "" }]));
    const { findByText } = renderWithNavigation(<SwipeScreen />);
    const saveButton = await findByText("Save");

    fireEvent.press(saveButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith("Saved", "Recipe added to favorites.");
    });
  });

  // UT10 – FR13: Swipe Left Animation
  it("Triggers swipe left animation", async () => {
    AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify([{ title: "Test Recipe", ingredients: [], instructions: [], source: "" }]));
    const { findByText } = renderWithNavigation(<SwipeScreen />);
    const skipButton = await findByText("Skip");

    fireEvent.press(skipButton);

    await waitFor(() => {
      expect(console.log).toHaveBeenCalledWith("Recipe discarded:", "Test Recipe");
    });
  });

  // UT11 – FR7: Navigation to New Search
  it("Navigates to new search screen", async () => {
    AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify([])); // No recipes
    const { findByText } = renderWithNavigation(<SwipeScreen />);
    const newSearchButton = await findByText("New Search");

    fireEvent.press(newSearchButton);

    expect(mockPush).toHaveBeenCalledWith("/(tabs)/ingredients");
  });
});