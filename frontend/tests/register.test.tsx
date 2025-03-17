import React from "react"
import { render, fireEvent, waitFor } from "@testing-library/react-native"
import RegisterScreen from "../app/register"

describe("Register Screen Tests", () => {
  // UT01 – Register with valid credentials
  it("registers successfully with valid email, name, and password", async () => {
    const { getByPlaceholderText, getByText } = render(<RegisterScreen />)

    fireEvent.changeText(getByPlaceholderText("email@domain.com"), "test@example.com")
    fireEvent.changeText(getByPlaceholderText("Name"), "Test User")
    fireEvent.changeText(getByPlaceholderText("Password"), "123456")
    fireEvent.press(getByText("Continue"))

    await waitFor(() => {
      expect(getByText("Account created! You can now log in.")).toBeTruthy()
    })
  })

  // UT02 – Register with invalid email
  it("shows error alert on invalid email format", async () => {
    const { getByPlaceholderText, getByText } = render(<RegisterScreen />)

    fireEvent.changeText(getByPlaceholderText("email@domain.com"), "test@.com")
    fireEvent.changeText(getByPlaceholderText("Name"), "Test User")
    fireEvent.changeText(getByPlaceholderText("Password"), "123456")
    fireEvent.press(getByText("Continue"))

    await waitFor(() => {
      expect(getByText("Please enter a valid email address.")).toBeTruthy()
    })
  })

  // UT03 – Register with short password (Boundary Value Analysis)
  it("shows error for short password", async () => {
    const { getByPlaceholderText, getByText } = render(<RegisterScreen />)

    fireEvent.changeText(getByPlaceholderText("email@domain.com"), "test@example.com")
    fireEvent.changeText(getByPlaceholderText("Name"), "Test User")
    fireEvent.changeText(getByPlaceholderText("Password"), "123")
    fireEvent.press(getByText("Continue"))

    await waitFor(() => {
      expect(getByText("Password must be at least 6 characters.")).toBeTruthy()
    })
  })
})
