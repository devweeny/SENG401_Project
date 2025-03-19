import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import SwipeScreen from "../app/(tabs)/swipe"; // If the rating component lives here, adjust if it's elsewhere
import { Alert } from "react-native";

jest.mock("expo-router", () => ({
    useRouter: () => ({ push: jest.fn() })
  }));
  
  jest.mock("@react-native-async-storage/async-storage", () => ({
    setItem: jest.fn(),
    getItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  }));

  jest.mock('@expo/vector-icons', () => ({
    Ionicons: jest.fn(() => null),
  }));

jest.spyOn(Alert, "alert");

describe("Recipe Rating", () => {
    // UT22 – FR19: Rate Recipe
    it("Submit rating", async () => {
        const { getByText } = render(<SwipeScreen />);

        fireEvent.press(getByText("⭐")); // assuming each star is a button or touchable
        fireEvent.press(getByText("Submit Rating"));

        await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
            "Rating Submitted",
            "Your rating has been saved."
        );
        });
    });
});
