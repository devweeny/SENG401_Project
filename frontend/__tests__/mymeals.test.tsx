import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import MyMealsScreen from "../app/(tabs)/mymeals";
import { Alert } from "react-native";

jest.spyOn(Alert, "alert");

describe("MyMealsScreen", () => {
    // UT12 – FR9: Search Recipes
    it("Search recipes by name or ingredient", async () => {
        const { getByPlaceholderText, getByText } = render(<MyMealsScreen />);

        fireEvent.changeText(getByPlaceholderText("Search recipes..."), "chicken");
        fireEvent.press(getByText("Search"));

        await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
            "Search Triggered",
            expect.stringContaining("chicken")
        );
        });
    });

    // UT13 – FR10: Apply Dietary Restrictions
    it("Apply dietary restrictions", async () => {
        const { getByTestId, getByText } = render(<MyMealsScreen />);
        const filterPicker = getByTestId("dietaryPicker");

        fireEvent.press(filterPicker);
        fireEvent.press(getByText("Vegan"));
        fireEvent.press(getByText("Apply Filter"));

        await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
            "Filter Applied",
            expect.stringContaining("Vegan")
        );
        });
    });

    // UT14 – FR11: Recipe Recommendation
    it("Generate recipe recommendation", async () => {
        const { getByText } = render(<MyMealsScreen />);
        fireEvent.press(getByText("Get Recommendation"));

        await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
            "Recommendation Ready",
            expect.stringContaining("recipe")
        );
    });
  });
});
