"use client"

import React, { useState } from "react"
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView } from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useRouter } from "expo-router"

export default function RegisterScreen() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [password, setPassword] = useState("")

  const handleRegister = async () => {
    if (!email || !password || !name) {
      alert("Please enter email, name and password.")
      return
    }

    try {
      const formData = new FormData()
      formData.append("email", email)
      formData.append("name", name)
      formData.append("password", password)

      const response = await fetch("https://ensf400.devweeny.ca/register", {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
        },
      })

      const data = await response.json()
      console.log(data)
      if (response.ok) {
        await AsyncStorage.setItem("user", JSON.stringify(data))
        alert("Account created! You can now log in.")
        router.push("/login")
      } else {
        alert(data.message || "Registration failed")
      }
    } catch (error: unknown) {
      console.error(error)
      alert(error instanceof Error ? error.message : "Network error occurred")
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
        <Text style={styles.createAccountText}>Create an account</Text>
        <Text style={styles.subtitleText}>Enter your email to sign up and get swiping!</Text>
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

        <TextInput style={styles.input} placeholder="Name" value={name} onChangeText={setName} />

        <TextInput
          style={styles.input}
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity style={styles.continueButton} onPress={handleRegister}>
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>

        <Text style={styles.orText}>or</Text>

        <TouchableOpacity style={styles.loginButton} onPress={() => router.push("/login")}>
          <Text style={styles.loginButtonText}>Login with Existing Email</Text>
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
    marginBottom: 30,
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
  createAccountText: {
    fontSize: 18,
    fontWeight: "500",
    marginBottom: 5,
  },
  subtitleText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    paddingHorizontal: 40,
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

