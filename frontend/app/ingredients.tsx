"use client"

import React, { useState } from "react"
import { View, Text, TextInput, StyleSheet, SafeAreaView, TouchableOpacity, Image, Button } from "react-native"
import { useRouter } from "expo-router"
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
  const router = useRouter()
  const [ingredients, setIngredients] = useState("")
  const [recipe, setRecipe] = useState("")

  const handleSearch = () => {
    // In a real app, you would search for recipes based on ingredients
    // For now, we'll just navigate to the swipe view
    router.push("/swipe")
  }

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
        <Button title="Generate Recipe" onPress={async () => {
          let data = await generateRecipe("chicken,rice,beans");
          console.log(data);
        }} />
      </View>

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navButton} onPress={() => router.push("/ingredients")}>
          <Ionicons name="time-outline" size={24} color="#000" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.navButton} onPress={handleSearch}>
          <Ionicons name="heart" size={24} color="#000" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.navButton} onPress={() => router.push("/mymeals")}>
          <Image source={{ uri: "https://randomuser.me/api/portraits/men/1.jpg" }} style={styles.profilePic} />
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
  bottomNav: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-around",
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
    paddingVertical: 15,
    backgroundColor: "white",
  },
  navButton: {
    alignItems: "center",
    justifyContent: "center",
    width: 40,
    height: 40,
  },
  profilePic: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
})

