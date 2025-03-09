"use client"

import { Redirect } from "expo-router"
import React, { useEffect, useState } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { View, ActivityIndicator } from "react-native"

export default function Index() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null)

  useEffect(() => {
    const checkLoginStatus = async () => {
      const loggedIn = await AsyncStorage.getItem("loggedIn")
      setIsLoggedIn(loggedIn === "true")
    }

    checkLoginStatus()
  }, [])

  if (isLoggedIn === null) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  if (isLoggedIn) {
    return <Redirect href="/ingredients" />
  }

  return <Redirect href="/login" />
}