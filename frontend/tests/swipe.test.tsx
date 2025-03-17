import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import SwipeScreen from "../app/(tabs)/swipe";
import { Alert } from "react-native";

jest.spyOn(Alert, "alert");

describe("SwipeScreen", () => {
    // UT15 – FR12: Swipe Right to Save Recipe
    it("UT15 – Swipe right saves recipe", async () => {
        const { getByText } = render(<SwipeScreen />);
        fireEvent.press(getByText("Swipe Right"));

        await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
            "Saved",
            "Recipe added to favorites."
        );
        });
    });

    // UT16 – FR13: Swipe Left to Discard Recipe
    it("UT16 – Swipe left discards recipe", async () => {
        const { getByText } = render(<SwipeScreen />);
        fireEvent.press(getByText("Swipe Left"));

        await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
            "Discarded",
            "Recipe removed."
        );
        });
    });

    // UT17 – FR14: View Favorites
    it("UT17 – View Favorites", () => {
        const { getByText } = render(<SwipeScreen />);
        fireEvent.press(getByText("Favorites"));

        expect(getByText("Your Favorite Recipes")).toBeTruthy();
    });

    // UT18 – FR15: Remove from Favorites
    it("UT18 – Remove from Favorites", async () => {
        const { getByText } = render(<SwipeScreen />);
        fireEvent.press(getByText("Remove"));

        await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
            "Removed",
            "Recipe deleted from favorites."
        );
        });
    });
});
