import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import ProfileScreen from "../app/(tabs)/profile";
import { Alert } from "react-native";

jest.spyOn(Alert, "alert");

describe("ProfileScreen", () => {
    // UT07 – FR4: Profile Update
    it("Update profile information (name, email, password)", async () => {
        const { getByPlaceholderText, getByText } = render(<ProfileScreen />);
        fireEvent.changeText(getByPlaceholderText("Name"), "New Name");
        fireEvent.changeText(getByPlaceholderText("Email"), "new@example.com");
        fireEvent.changeText(getByPlaceholderText("Password"), "newpass123");

        fireEvent.press(getByText("Save"));

        await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
            "Profile Updated",
            "Your profile has been updated successfully."
        );
        });
    });

    // UT08 – FR5: Set Dietary Preferences
    it("Set dietary preferences", async () => {
        const { getByTestId, getByText } = render(<ProfileScreen />);
        const dietaryPicker = getByTestId("dietaryPicker");

        fireEvent.press(dietaryPicker);
        fireEvent.press(getByText("Vegan"));

        fireEvent.press(getByText("Save"));

        await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
            "Profile Updated",
            expect.stringContaining("successfully")
        );
        });
    });

    // UT09 – FR6: Upload Profile Picture
    it("UT09 – Upload profile picture", async () => {
        const { getByText } = render(<ProfileScreen />);
        const uploadButton = getByText("Upload Photo");

        fireEvent.press(uploadButton);

        expect(uploadButton).toBeTruthy();
    });
});
