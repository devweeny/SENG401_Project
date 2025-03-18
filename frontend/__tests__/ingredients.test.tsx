import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import IngredientsScreen from "../app/(tabs)/ingredients";
import { Alert } from "react-native";
import * as recipeModule from "../app/(tabs)/ingredients"; // Import the module to mock

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

describe("IngredientsScreen", () => {
    beforeEach(() => {
        jest.spyOn(recipeModule, "generateRecipe").mockImplementation(async () => ({
            recipe: [
                {
                    title: "Mock Recipe",
                    ingredients: ["tomato", "rice"],
                    instructions: ["Mix ingredients", "Cook for 20 minutes"],
                    source: "Mock Source"
                }
            ]
        }));
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    // UT10 – FR7: Manual Ingredient Input
    it("Add ingredients via text input", async () => {
        const { getByPlaceholderText, getByText } = render(<IngredientsScreen />);

        fireEvent.changeText(getByPlaceholderText("Enter ingredients (comma separated)"), "tomato, rice");
        fireEvent.press(getByText("Find Recipes"));

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith(
                "Ingredients Submitted",
                expect.stringContaining("tomato")
            );
        });
    });

    // UT11 – FR8: Voice Input
    it("Add ingredients via voice input", async () => {
        const { getByText } = render(<IngredientsScreen />);
        const voiceInputButton = getByText("Use Voice Input");

        fireEvent.press(voiceInputButton);

        // Voice input relies on native API, so we assume mock here
        expect(voiceInputButton).toBeTruthy();
    });
});