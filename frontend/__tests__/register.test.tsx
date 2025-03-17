import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import RegisterScreen from "../app/register";
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

jest.spyOn(Alert, "alert");

describe("RegisterScreen", () => {
  const uniqueEmail = () => `test${Date.now()}@example.com`;

  // UT01 – FR1: Register with Valid Credentials
  it("Register with valid credentials", async () => {
    const { getByPlaceholderText, getByText } = render(<RegisterScreen />);
    fireEvent.changeText(getByPlaceholderText("email@domain.com"), uniqueEmail());
    fireEvent.changeText(getByPlaceholderText("Name"), "Test User");
    fireEvent.changeText(getByPlaceholderText("Password"), "123456");
    fireEvent.press(getByText("Continue"));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        "Account created! You can now log in."
      );
    });
  });

  // UT02 – FR1: Register with Invalid Email
  it("Register with invalid email format", async () => {
    const { getByPlaceholderText, getByText } = render(<RegisterScreen />);
    fireEvent.changeText(getByPlaceholderText("email@domain.com"), "invalid@.com");
    fireEvent.changeText(getByPlaceholderText("Name"), "Test User");
    fireEvent.changeText(getByPlaceholderText("Password"), "123456");
    fireEvent.press(getByText("Continue"));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        expect.stringContaining("Invalid email format")
      );
    });
  });

  // UT03 – FR1: Register with short password (Boundary Test)
  it("Register with short password", async () => {
    const { getByPlaceholderText, getByText } = render(<RegisterScreen />);
    fireEvent.changeText(getByPlaceholderText("email@domain.com"), uniqueEmail());
    fireEvent.changeText(getByPlaceholderText("Name"), "Test User");
    fireEvent.changeText(getByPlaceholderText("Password"), "123");
    fireEvent.press(getByText("Continue"));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        expect.stringContaining("Password must be at least 6 characters long")
      );
    });
  });
});
