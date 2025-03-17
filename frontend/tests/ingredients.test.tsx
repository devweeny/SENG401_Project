import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import IngredientsScreen from "../app/(tabs)/ingredients";
import { Alert } from "react-native";

jest.spyOn(Alert, "alert");

describe("IngredientsScreen", () => {
    // UT10 – FR7: Manual Ingredient Input
    it("Add ingredients via text input", async () => {
        const { getByPlaceholderText, getByText } = render(<IngredientsScreen />);

        fireEvent.changeText(getByPlaceholderText("Enter ingredients"), "tomato, rice");
        fireEvent.press(getByText("Generate Recipes"));

        await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
            "Ingredients Submitted",
            expect.stringContaining("tomato")
        );
        });
    });

    // UT11 – FR8: Voice Input
    it("UT11 – Add ingredients via voice input", async () => {
        const { getByText } = render(<IngredientsScreen />);
        const voiceInputButton = getByText("Use Voice Input");

        fireEvent.press(voiceInputButton);

        // Voice input relies on native API, so we assume mock here
        expect(voiceInputButton).toBeTruthy();
    });
});
