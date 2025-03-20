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

beforeEach(() => {
  jest.clearAllMocks(); // Clear all mocks before each test
  jest.spyOn(Alert, "alert").mockImplementation(jest.fn()); // Reapply mock for Alert.alert

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
  // UT31 – FR2: Logs in with valid credentials
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
      expect(mockPush).toHaveBeenCalledWith("/ingredients");
    });
  });

  // UT32 – FR2: Shows error for invalid credentials
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

  // UT33 – FR2: Shows error for empty fields
  it("Continue as Guest navigates to homepage", async () => {
    const { getByText } = render(<LoginScreen />);
    const guestButton = await waitFor(() => getByText("Continue as Guest"));
    fireEvent.press(guestButton);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/ingredients");
    });
  });

  // UT34 – FR3: Allows guest login
  it("Displays validation error for empty email", async () => {
    const { getByPlaceholderText, getByText, queryByText } = render(<LoginScreen />);
    fireEvent.changeText(getByPlaceholderText("email@domain.com"), "");
    fireEvent.changeText(getByPlaceholderText("Password"), "123456");
    fireEvent.press(getByText("Log in"));

    await waitFor(() => {
      expect(queryByText("Email is required")).not.toBeNull();
    });
  });

  // UT35 – FR2: Handles server error during login
  it("Displays validation error for invalid email format", async () => {
    const { getByPlaceholderText, getByText, queryByText } = render(<LoginScreen />);
    fireEvent.changeText(getByPlaceholderText("email@domain.com"), "invalid-email");
    fireEvent.changeText(getByPlaceholderText("Password"), "123456");
    fireEvent.press(getByText("Log in"));

    await waitFor(() => {
      expect(queryByText("Please enter a valid email")).not.toBeNull();
    });
  });

  // UT36 – FR2: Display validation error for empty password
  it("Displays validation error for empty password", async () => {
    const { getByPlaceholderText, getByText, queryByText } = render(<LoginScreen />);
    fireEvent.changeText(getByPlaceholderText("email@domain.com"), "test@example.com");
    fireEvent.changeText(getByPlaceholderText("Password"), "");
    fireEvent.press(getByText("Log in"));

    await waitFor(() => {
      expect(queryByText("Password is required")).not.toBeNull();
    });
  });

  // UT37 – FR2: Redirects to registration screen
  it("Handles network error during login", async () => {
    global.fetch = jest.fn(() =>
      Promise.reject(new Error("Network error occurred"))
    );

    const { getByPlaceholderText, getByText } = render(<LoginScreen />);
    fireEvent.changeText(getByPlaceholderText("email@domain.com"), "test@example.com");
    fireEvent.changeText(getByPlaceholderText("Password"), "123456");
    fireEvent.press(getByText("Log in"));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        "Network Error",
        "Network error occurred"
      );
    });
  });
});
