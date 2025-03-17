import React from "react"
import { render, fireEvent, waitFor } from "@testing-library/react-native"
import LoginScreen from "../app/login"

// 👇 Inline mock (MUST be before importing anything else that uses AsyncStorage)
jest.mock('@react-native-async-storage/async-storage', () => ({
    setItem: jest.fn(),
    getItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn()
  }))
  

describe("Login Screen Tests", () => {
  // UT04 – Login with valid credentials
  it("logs in successfully with correct email and password", async () => {
    const { getByPlaceholderText, getByText } = render(<LoginScreen />)

    fireEvent.changeText(getByPlaceholderText("email@domain.com"), "test@example.com")
    fireEvent.changeText(getByPlaceholderText("Password"), "123456")
    fireEvent.press(getByText("Log in"))

    await waitFor(() => {
      expect(getByText("Redirecting to ingredients...")).toBeTruthy()
    })
  })

  // UT05 – Login with incorrect password
  it("shows error on incorrect password", async () => {
    const { getByPlaceholderText, getByText } = render(<LoginScreen />)

    fireEvent.changeText(getByPlaceholderText("email@domain.com"), "test@example.com")
    fireEvent.changeText(getByPlaceholderText("Password"), "wrongpass")
    fireEvent.press(getByText("Log in"))

    await waitFor(() => {
      expect(getByText("Invalid credentials. Please try again.")).toBeTruthy()
    })
  })

  // UT06 – Continue as guest
  it("allows user to continue as guest", async () => {
    const { getByText } = render(<LoginScreen />)
    fireEvent.press(getByText("Continue as Guest"))

    await waitFor(() => {
      expect(getByText("Guest session started")).toBeTruthy()
    })
  })
})
