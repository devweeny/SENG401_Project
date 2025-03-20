import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import RegisterScreen from "../app/register";
import { Alert } from "react-native";

jest.mock("expo-router", () => ({
  useRouter: () => ({ push: jest.fn() }),
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

  // UT12 – FR1: Register with Valid Credentials
  it("Register with valid credentials", async () => {
    const { getByPlaceholderText, getByText, queryByText } = render(<RegisterScreen />);
    fireEvent.changeText(getByPlaceholderText("email@domain.com"), uniqueEmail());
    fireEvent.changeText(getByPlaceholderText("Name"), "Test User");
    fireEvent.changeText(getByPlaceholderText("Password"), "123456");
    fireEvent.press(getByText("Continue"));

    // Ensure no validation errors are displayed
    expect(queryByText("Email is required")).toBeNull();
    expect(queryByText("Name is required")).toBeNull();
    expect(queryByText("Password is required")).toBeNull();
  });

  // UT13 – FR1: Register with Empty Fields
  it("Shows an error when fields are empty", async () => {
    const { getByText, queryByText } = render(<RegisterScreen />);
    fireEvent.press(getByText("Continue"));

    // Check for inline error messages
    expect(queryByText("Email is required")).toBeTruthy();
    expect(queryByText("Name is required")).toBeTruthy();
    expect(queryByText("Password is required")).toBeTruthy();
  });

  // UT14 – FR1: Register with Invalid Email
  it("Shows an error for invalid email format", async () => {
    const { getByPlaceholderText, getByText, queryByText } = render(<RegisterScreen />);
    fireEvent.changeText(getByPlaceholderText("email@domain.com"), "invalid@.com");
    fireEvent.changeText(getByPlaceholderText("Name"), "Test User");
    fireEvent.changeText(getByPlaceholderText("Password"), "123456");
    fireEvent.press(getByText("Continue"));

    // Check for inline error message
    expect(queryByText("Please enter a valid email")).toBeTruthy();
  });

  // UT15 – FR1: Register with Short Password
  it("Shows an error for short password", async () => {
    const { getByPlaceholderText, getByText, queryByText } = render(<RegisterScreen />);
    fireEvent.changeText(getByPlaceholderText("email@domain.com"), uniqueEmail());
    fireEvent.changeText(getByPlaceholderText("Name"), "Test User");
    fireEvent.changeText(getByPlaceholderText("Password"), "12");
    fireEvent.press(getByText("Continue"));

    // Check for inline error message
    expect(queryByText("Password must be at least 3 characters")).toBeTruthy();
  });

  // UT16 – FR1: Register with Short Name
  it("Shows an error for short name", async () => {
    const { getByPlaceholderText, getByText, queryByText } = render(<RegisterScreen />);
    fireEvent.changeText(getByPlaceholderText("email@domain.com"), uniqueEmail());
    fireEvent.changeText(getByPlaceholderText("Name"), "Te");
    fireEvent.changeText(getByPlaceholderText("Password"), "123456");
    fireEvent.press(getByText("Continue"));

    // Check for inline error message
    expect(queryByText("Name must be at least 3 characters")).toBeTruthy();
  });
});