"use client"

import React, { useState } from "react"
import { View, Text, TextInput, StyleSheet, SafeAreaView, TouchableOpacity, Button } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import AsyncStorage from "@react-native-async-storage/async-storage"

const generateRecipe = async (ingredients: string) => {
  let token = await AsyncStorage.getItem("token");
  if (token) {
    token = token.slice(1, -1);
  }
  const formData = new FormData();
  formData.append("ingredients", ingredients);
  try {
    let response = await fetch("https://seng401.devweeny.ca/generate", {
      method: "POST",
      body: formData,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': "application/json",
      },
    });
    let data = await response.json();
      return data;
  } catch (error) {
    console.log(error)
  }
};

export default function IngredientsScreen() {
  const [ingredients, setIngredients] = useState("")
  const [recipe, setRecipe] = useState("")

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Lets Shake</Text>
        <Text style={styles.title}>and Bake!</Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Select your ingredients"
            value={ingredients}
            onChangeText={setIngredients}
          />
        </View>

        <Text style={styles.orText}>or</Text>

        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for a recipe"
            value={recipe}
            onChangeText={setRecipe}
          />
        </View>
        
        <TouchableOpacity 
          style={styles.findButton}
          onPress={async () => {
            let data = await generateRecipe("chicken,rice,beans");
            console.log(data);
          }}
        >
          <Text style={styles.findButtonText}>Find Recipes</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  header: {
    alignItems: "center",
    marginTop: 60,
    marginBottom: 40,
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    textAlign: "center",
    lineHeight: 45,
  },
  searchContainer: {
    paddingHorizontal: 20,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 25,
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: "#F5F5F5",
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
  },
  orText: {
    textAlign: "center",
    marginVertical: 10,
    color: "#888",
  },
  findButton: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 20,
  },
  findButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
})