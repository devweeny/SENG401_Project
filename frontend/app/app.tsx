"use client"

import React, { useEffect, useState } from "react"
import { Stack } from "expo-router"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useRouter, useSegments } from "expo-router"

function RootLayoutNav() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null)
  const segments = useSegments()
  const router = useRouter()

  useEffect(() => {
    const checkLoginStatus = async () => {
      const loggedIn = await AsyncStorage.getItem("loggedIn")
      setIsLoggedIn(loggedIn === "true")
    }

    checkLoginStatus()
  }, [])

  useEffect(() => {
    router.replace("/");
  }, [router]);

  useEffect(() => {
    if (isLoggedIn === null) return

    const inAuthGroup = segments[0] === "login" || segments[0] === "register"

    if (isLoggedIn && inAuthGroup) {
      router.replace("/ingredients")
    } else if (!isLoggedIn && !inAuthGroup) {
      router.replace("/login")
    }
  }, [isLoggedIn, segments, router])

  return (
    <Stack>
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="register" options={{ headerShown: false }} />
      <Stack.Screen name="ingredients" options={{ headerShown: false }} />
      <Stack.Screen name="swipe" options={{ headerShown: false }} />
      <Stack.Screen name="mymeals" options={{ headerShown: false }} />
    </Stack>
  )
}

export default function RootLayout() {
  return <RootLayoutNav />
}

