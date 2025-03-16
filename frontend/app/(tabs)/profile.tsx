"use client"

import React, { useState, useEffect } from "react"
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from "react-native"
import { router } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import AsyncStorage from "@react-native-async-storage/async-storage"

export default function ProfileScreen() {
  const [userData, setUserData] = useState<{email?: string, name?: string, guest?: boolean} | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadUserData = async () => {
      try {
        // First check for user data from registration
        const user = await AsyncStorage.getItem("user")
        
        if (user) {
          const parsedUser = JSON.parse(user)
          console.log("Found user data:", parsedUser)
          setUserData(parsedUser)
        } else {
          // If no user data is found, check if a token exists (meaning they logged in)
          const token = await AsyncStorage.getItem("token")
          const email = await AsyncStorage.getItem("email")
          const name = await AsyncStorage.getItem("name")
          
          if (token) {
            console.log("Found token but no user data, using email/name if available")
            // User is logged in but we don't have their profile data from registration
            setUserData({ 
              email: email || "User Email", 
              name: name || "User"
            })
          } else {
            // Default to guest mode if nothing else
            console.log("No user data or token found, assuming guest mode")
            setUserData({ guest: true })
          }
        }
      } catch (error) {
        console.error("Error loading user data:", error)
        setUserData({ guest: true })
      } finally {
        setIsLoading(false)
      }
    }
    
    loadUserData()
  }, [])

  const handleLogout = async () => {
    try {
      await AsyncStorage.clear()
      alert("You are logged out.")
      router.replace("/login")
    } catch (error) {
      alert("Failed to log out. Please try again.")
    }
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <View style={styles.profileContainer}>
        <View style={styles.avatarContainer}>
          <Ionicons name="person-circle" size={120} color="#FF6B6B" />
        </View>

        <View style={styles.infoContainer}>
          {userData?.guest ? (
            <Text style={styles.nameText}>Logged in as Guest</Text>
          ) : (
            <>
              <Text style={styles.nameText}>{userData?.name || "User"}</Text>
              <Text style={styles.emailText}>{userData?.email || ""}</Text>
            </>
          )}
        </View>

        <View style={styles.separator} />

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Log Out</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>MealMatcher v1.0.0</Text>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#888",
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },
  profileContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  infoContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  nameText: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 5,
  },
  emailText: {
    fontSize: 16,
    color: "#888",
  },
  separator: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginBottom: 30,
  },
  logoutButton: {
    backgroundColor: "#FF3B30",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
  },
  logoutButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  versionText: {
    textAlign: "center",
    color: "#888",
    fontSize: 12,
    marginTop: 10,
  },
})