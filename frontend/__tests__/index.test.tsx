import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import IndexScreen from "../app/index";
import AsyncStorage from "@react-native-async-storage/async-storage";

jest.mock("expo-router", () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

jest.mock("@react-native-async-storage/async-storage", () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

describe("IndexScreen", () => {
  // UT06 – FR3: Guest Access
  it("Continue as Guest navigates to homepage", () => {
    const mockPush = jest.fn();
    jest.mock("expo-router", () => ({
      useRouter: () => ({
        push: mockPush,
      }),
    }));

    const { getByText } = render(<IndexScreen />);
    const guestButton = getByText("Continue as Guest");

    fireEvent.press(guestButton);
    expect(mockPush).toHaveBeenCalledWith("/ingredients");
  });
});