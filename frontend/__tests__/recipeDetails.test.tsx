
import React from "react";
import { render } from "@testing-library/react-native";
import RecipeDetailsScreen from "../app/(tabs)/mymeals"; // Adjust if you have a separate details screen

describe("RecipeDetailsScreen", () => {
    // UT19 – FR16: View Step-by-Step Instructions
    it("Display step-by-step recipe instructions", () => {
        const { getByText } = render(<RecipeDetailsScreen />);

        expect(getByText("Step-by-Step Instructions")).toBeTruthy();
        expect(getByText("Step 1")).toBeTruthy(); // assuming at least one instruction is displayed
    });

    // UT20 – FR17: View Metadata (prep time, cook time, difficulty)
    it("Display recipe metadata (prep/cook time, difficulty)", () => {
        const { getByText } = render(<RecipeDetailsScreen />);

        expect(getByText(/Prep Time:/)).toBeTruthy();
        expect(getByText(/Cook Time:/)).toBeTruthy();
        expect(getByText(/Difficulty:/)).toBeTruthy();
    });
    
    // UT21 – FR18: View Ingredient Quantities
    it("UT21 – Display required ingredients with quantities", () => {
        const { getByText } = render(<RecipeDetailsScreen />);

        expect(getByText(/Ingredients:/)).toBeTruthy();
        expect(getByText(/tomato - 2 pcs/)).toBeTruthy(); // example format
    });
});
