import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import LoginScreen from "../app/login";
import { Alert } from "react-native";

const mockPush = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockPush, // Add replace to the mock
  }),
}));

jest.mock("@react-native-async-storage/async-storage", () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

jest.spyOn(Alert, "alert");

beforeEach(() => {
  global.fetch = jest.fn((url, options) => {
    if (url === "https://seng401.devweeny.ca/login" && options.method === "POST") {
      const formData = options.body;
      if (formData.get("email") === "test@example.com" && formData.get("password") === "123456") {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ token: "mockToken", user: { id: 1, name: "Test User" } }),
        });
      }
    }
    return Promise.resolve({
      ok: false,
      json: () => Promise.resolve({ message: "Invalid email or password" }),
    });
  });
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("LoginScreen", () => {
    // UT04 – FR2: Login with Valid Credentials
  it("Login with valid credentials", async () => {
    const { getByPlaceholderText, getByText } = render(<LoginScreen />);
    fireEvent.changeText(getByPlaceholderText("email@domain.com"), "test@example.com");
    fireEvent.changeText(getByPlaceholderText("Password"), "123456");
    fireEvent.press(getByText("Log in"));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        "Login Success",
        "You have successfully logged in!"
      );
    });
  });

  // UT05 – FR2: Login with Invalid Password
  it("Login with invalid password", async () => {
    const { getByPlaceholderText, getByText } = render(<LoginScreen />);
    fireEvent.changeText(getByPlaceholderText("email@domain.com"), "test@example.com");
    fireEvent.changeText(getByPlaceholderText("Password"), "wrongpass");
    fireEvent.press(getByText("Log in"));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        "Login Error",
        expect.stringContaining("Invalid email or password")
      );
    });
  });

  // UT06 
  it("Continue as Guest navigates to homepage", async () => {
    const { getByText } = render(<LoginScreen />);
    
    // Ensure the button is found and pressed
    const guestButton = await waitFor(() => getByText("Continue as Guest"));
    fireEvent.press(guestButton);
  
    // Verify navigation
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/ingredients");
    });
  });
});
