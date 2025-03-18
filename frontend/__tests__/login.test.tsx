import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import LoginScreen from "../app/login";
import { Alert } from "react-native";

const mockPush = jest.fn();

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
      const guestButton = await waitFor(() => getByText("Continue as Guest"), { timeout: 3000 }); // Increase timeout to 3000ms
      fireEvent.press(guestButton);
    
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/ingredients");
      });
    });
});
