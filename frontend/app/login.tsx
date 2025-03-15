"use client"

import React, { useState } from "react"
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView } from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useRouter } from "expo-router"

export default function LoginScreen() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleLogin = async () => {
    try {
      const formData = new FormData()
      formData.append("email", email)
      formData.append("password", password)

      const response = await fetch("https://seng401.devweeny.ca/login", {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
        },
      })

      const data = await response.json()

      console.log(data)

      if (response.ok) {
        await AsyncStorage.setItem("loggedIn", "true")
        await AsyncStorage.setItem("user", JSON.stringify(data))
        router.replace("/ingredients")
      } else {
        alert(data.message || "Login failed")
      }
    } catch (error: any) {
      alert(error.message || "Network error occurred")
    }
  }

  const handleGuest = async () => {
    try {
      await AsyncStorage.setItem("loggedIn", "true"); 
      await AsyncStorage.setItem("user", JSON.stringify({ guest: true })); 
      router.replace("/ingredients"); 
    } catch (error: any) {
      alert(error.message || "An error occurred while continuing as a guest.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.logoContainer}>
        <Text style={styles.logoText}>
          <Text style={styles.logoM}>M</Text>
          <Text style={styles.logoE}>e</Text>
          <Text style={styles.logoA}>a</Text>
          <Text style={styles.logoL}>l</Text>
          <Text style={styles.logoBlack}>Matcher</Text>
        </Text>
        <Text style={styles.loginText}>Login</Text>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="email@domain.com"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity style={styles.continueButton} onPress={handleLogin}>
          <Text style={styles.continueButtonText}>Log in</Text>
        </TouchableOpacity>

        <Text style={styles.orText}>or</Text>

        <TouchableOpacity style={styles.signUpButton} onPress={() => router.push("/register")}>
          <Text style={styles.signUpButtonText}>Sign Up</Text>
        </TouchableOpacity>

        <Text style={styles.orText}>or</Text>

        <TouchableOpacity style={styles.guestButton} onPress={handleGuest}>
          <Text style={styles.guestButtonText}>Continue as Guest</Text>
        </TouchableOpacity>

      </View>

      <View style={styles.navBar}>
        <View style={styles.navIndicator} />
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  logoContainer: {
    alignItems: "center",
    marginTop: 60,
    marginBottom: 40,
  },
  logoText: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 10,
  },
  logoM: {
    color: "#FF0000", // Red
  },
  logoE: {
    color: "#FFA500", // Orange
  },
  logoA: {
    color: "#008000", // Green
  },
  logoL: {
    color: "#0000FF", // Blue
  },
  logoBlack: {
    color: "#000000", // Black
  },
  loginText: {
    fontSize: 18,
    fontWeight: "500",
  },
  inputContainer: {
    paddingHorizontal: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 5,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  continueButton: {
    backgroundColor: "#000000",
    borderRadius: 5,
    padding: 15,
    alignItems: "center",
    marginBottom: 15,
  },
  continueButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
  orText: {
    textAlign: "center",
    marginVertical: 15,
    color: "#888",
  },
  signUpButton: {
    backgroundColor: "#F0F0F0",
    borderRadius: 5,
    padding: 15,
    alignItems: "center",
  },
  signUpButtonText: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "500",
  },
  navBar: {
    position: "absolute",
    bottom: 20,
    width: "100%",
    alignItems: "center",
  },
  navIndicator: {
    width: 60,
    height: 5,
    backgroundColor: "#000",
    borderRadius: 3,
  },
  guestButton: {
    backgroundColor: "#E0E0E0",
    borderRadius: 5,
    padding: 15,
    alignItems: "center",
    marginTop: 15,
  },
  guestButtonText: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "500",
  },
})

