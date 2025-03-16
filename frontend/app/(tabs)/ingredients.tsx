"use client"

import React, { useState } from "react"
import { View, Text, TextInput, StyleSheet, SafeAreaView, TouchableOpacity, ActivityIndicator, Alert } from "react-native"
import { router } from "expo-router"
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
    console.log(error);
    return { error: "Failed to get recipes" };
  }
};

export default function IngredientsScreen() {
  const [ingredients, setIngredients] = useState("")
  const [recipe, setRecipe] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleFindRecipes = async () => {
    if (!ingredients.trim() && !recipe.trim()) {
      Alert.alert("Please enter ingredients or a recipe name");
      return;
    }

    setIsLoading(true);
    try {
      // We'll prioritize ingredients search over recipe name
      const searchTerms = ingredients.trim() ? ingredients : recipe;
      const data = await generateRecipe(searchTerms);
      
      if (data.error) {
        Alert.alert("Error", data.error);
        return;
      }

      // Store the recipes in AsyncStorage so we can access them in the swipe screen
      await AsyncStorage.setItem("generatedRecipes", JSON.stringify(data.recipe || []));
      
      // Navigate to the swipe screen
      router.push("/(tabs)/swipe");
    } catch (error) {
      console.error("Error generating recipes:", error);
      Alert.alert("Error", "Something went wrong while getting recipes");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Lets Shake</Text>
        <Text style={styles.title}>and Bake!</Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Ionicons name="restaurant-outline" size={20} color="#888" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Enter ingredients (comma separated)"
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
          onPress={handleFindRecipes}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.findButtonText}>Find Recipes</Text>
          )}
        </TouchableOpacity>
        
        <Text style={styles.exampleText}>
          Try: chicken, rice, beans or pasta, tomatoes, garlic
        </Text>
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
    minHeight: 50,
  },
  findButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  exampleText: {
    textAlign: 'center',
    color: '#888',
    marginTop: 15,
    fontSize: 12,
    fontStyle: 'italic',
  },
})