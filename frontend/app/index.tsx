"use client"

import { Redirect } from "expo-router"
import React, { useEffect, useState } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { View, ActivityIndicator } from "react-native"

export default function Index() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null)

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const loggedIn = await AsyncStorage.getItem("loggedIn")
        console.log("Login status:", loggedIn)
        setIsLoggedIn(loggedIn === "true")
      } catch (error) {
        console.error("Error checking login status:", error)
        setIsLoggedIn(false) // Default to not logged in if there's an error
      }
    }

    checkLoginStatus()
  }, [])

  if (isLoggedIn === null) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#FF6B6B" />
      </View>
    )
  }

  // Only redirect to tabs if explicitly logged in
  if (isLoggedIn === true) {
    return <Redirect href="/(tabs)/ingredients" />
  }

  // Always default to login if not explicitly logged in
  return <Redirect href="/login" />
}