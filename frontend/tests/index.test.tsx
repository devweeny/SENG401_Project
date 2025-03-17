import React from "react"
import { render, waitFor } from "@testing-library/react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import IndexScreen from "../app/index"
import { useRouter } from "expo-router"

jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
}))

const mockRouter = useRouter()

describe("Index Screen Navigation Tests", () => {
  // UT25 – Auto-redirect to ingredients page when logged in
  it("redirects to ingredients screen if user is logged in", async () => {
    AsyncStorage.getItem = jest.fn(() => Promise.resolve("true"))

    render(<IndexScreen />)

    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith("/ingredients")
    })
  })

  // UT26 – Redirect to login screen if no login token exists
  it("redirects to login screen if user is not logged in", async () => {
    AsyncStorage.getItem = jest.fn(() => Promise.resolve(null))

    render(<IndexScreen />)

    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith("/login")
    })
  })
})
