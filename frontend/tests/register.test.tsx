// UT01 – FR1: Register with Valid Credentials
import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import RegisterScreen from "../app/register";
import { Alert } from "react-native";

jest.mock("expo-router", () => ({
  useRouter: () => ({ push: jest.fn() })
}));

jest.spyOn(Alert, "alert");

describe("RegisterScreen", () => {
  it("UT01 – Register with valid credentials", async () => {
    const { getByPlaceholderText, getByText } = render(<RegisterScreen />);
    fireEvent.changeText(getByPlaceholderText("Email"), "test@example.com");
    fireEvent.changeText(getByPlaceholderText("Name"), "Test User");
    fireEvent.changeText(getByPlaceholderText("Password"), "123456");
    fireEvent.press(getByText("Register"));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        "Registration Success",
        "You have successfully registered!"
      );
    });
  });

  // UT02 – FR1: Register with Invalid Email
  it("UT02 – Register with invalid email format", async () => {
    const { getByPlaceholderText, getByText } = render(<RegisterScreen />);
    fireEvent.changeText(getByPlaceholderText("Email"), "invalid@.com");
    fireEvent.changeText(getByPlaceholderText("Name"), "Test User");
    fireEvent.changeText(getByPlaceholderText("Password"), "123456");
    fireEvent.press(getByText("Register"));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        "Registration Error",
        expect.stringContaining("Invalid email format")
      );
    });
  });

  // UT03 – FR1: Register with short password (Boundary Test)
  it("UT03 – Register with short password", async () => {
    const { getByPlaceholderText, getByText } = render(<RegisterScreen />);
    fireEvent.changeText(getByPlaceholderText("Email"), "test@example.com");
    fireEvent.changeText(getByPlaceholderText("Name"), "Test User");
    fireEvent.changeText(getByPlaceholderText("Password"), "123");
    fireEvent.press(getByText("Register"));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        "Registration Error",
        expect.stringContaining("Password must be at least 6 characters")
      );
    });
  });
});
