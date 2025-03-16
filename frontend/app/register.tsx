"use client"

import React, { useState } from "react"
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView } from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useRouter } from "expo-router"

export default function RegisterScreen() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      alert("Passwords do not match")
      return
    }

    try {
      // Create form data to send to API
      const formData = new FormData()
      formData.append("name", name)
      formData.append("email", email)
      formData.append("password", password)
      formData.append("c_password", confirmPassword)

      const response = await fetch("https://seng401.devweeny.ca/register", {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
        },
      })

      const data = await response.json()
      console.log(data)

      if (response.ok) {
        // Save login information
        await AsyncStorage.setItem("loggedIn", "true")
        await AsyncStorage.setItem("token", JSON.stringify(data.token))
        
        // Save user data for profile page
        const userData = {
          name: name,
          email: email
        }
        await AsyncStorage.setItem("user", JSON.stringify(userData))
        
        router.replace("/ingredients")
      } else {
        if (data.message && typeof data.message === "object") {
          const messages = Object.values(data.message).flat()
          alert(messages.join("\n"))
        } else {
          alert(data.message || "Registration failed")
        }
      }
    } catch (error: any) {
      alert(error.message || "Network error occurred")
    }
  }

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
        <Text style={styles.registrationText}>Sign Up</Text>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Name"
          value={name}
          onChangeText={setName}
        />

        <TextInput
          style={styles.input}
          placeholder="Email"
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

        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />

        <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
          <Text style={styles.registerButtonText}>Sign Up</Text>
        </TouchableOpacity>

        <Text style={styles.orText}>or</Text>

        <TouchableOpacity style={styles.loginButton} onPress={() => router.push("/login")}>
          <Text style={styles.loginButtonText}>Login</Text>
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
  registrationText: {
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
  registerButton: {
    backgroundColor: "#000000",
    borderRadius: 5,
    padding: 15,
    alignItems: "center",
    marginBottom: 15,
  },
  registerButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
  orText: {
    textAlign: "center",
    marginVertical: 15,
    color: "#888",
  },
  loginButton: {
    backgroundColor: "#F0F0F0",
    borderRadius: 5,
    padding: 15,
    alignItems: "center",
  },
  loginButtonText: {
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
})