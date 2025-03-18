import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import RecipeDetailsScreen from "../app/(tabs)/mymeals"; // Adjust if you have a separate details screen

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
      return Promise.resolve(JSON.stringify([
        { title: "Test Recipe", ingredients: ["Ingredient 1"], instructions: ["Step 1"], source: "Test Source", prepTime: "10 mins", cookTime: "20 mins", difficulty: "Easy" }
      ]));
    }
    return Promise.resolve(null);
  }),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

jest.mock('@expo/vector-icons', () => ({
  Ionicons: jest.fn(() => null),
}));

describe("RecipeDetailsScreen", () => {
    // UT19 – FR16: View Step-by-Step Instructions
    it("Display step-by-step recipe instructions", async () => {
        const { getByText, findByText } = render(<RecipeDetailsScreen />);

        const viewFullRecipeButton = await findByText("View Full Recipe");
        fireEvent.press(viewFullRecipeButton);

        await waitFor(() => {
            expect(getByText("Step-by-Step Instructions")).toBeTruthy();
            expect(getByText("Step 1")).toBeTruthy(); // assuming at least one instruction is displayed
        });
    });

    // UT20 – FR17: View Metadata (prep time, cook time, difficulty)
    it("Display recipe metadata (prep/cook time, difficulty)", async () => {
        const { getByText, findByText } = render(<RecipeDetailsScreen />);

        const viewFullRecipeButton = await findByText("View Full Recipe");
        fireEvent.press(viewFullRecipeButton);

        await waitFor(() => {
            expect(getByText(/Prep Time:/)).toBeTruthy();
            expect(getByText(/Cook Time:/)).toBeTruthy();
            expect(getByText(/Difficulty:/)).toBeTruthy();
        });
    });
    
    // UT21 – FR18: View Ingredient Quantities
    it("Display required ingredients with quantities", async () => {
        const { getByText, findByText } = render(<RecipeDetailsScreen />);

        const viewFullRecipeButton = await findByText("View Full Recipe");
        fireEvent.press(viewFullRecipeButton);

        await waitFor(() => {
            expect(getByText(/Ingredients:/)).toBeTruthy();
            expect(getByText(/Ingredient 1/)).toBeTruthy(); // example format
        });
    });
});
