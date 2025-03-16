"use client"
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image, TextInput, ScrollView } from "react-native"
import { router } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import React, { useState } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function MyMealsScreen() {
  const handleLogout = async () => {
    try {
      await AsyncStorage.clear(); 
      alert("You are logged out."); 
      router.replace("/login"); 
    } catch (error) {
      alert("Failed to log out. Please try again.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
        <TextInput style={styles.searchInput} placeholder="Search" />
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity style={styles.tabButton}>
          <Ionicons name="heart" size={20} color="#000" />
          <Text style={styles.tabText}>Favorites</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabButton}>
          <Ionicons name="time-outline" size={20} color="#000" />
          <Text style={styles.tabText}>History</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.recipeCard}>
          <Image
            source={{
              uri: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cGVhcnN8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=800&q=60",
            }}
            style={styles.recipeImage}
          />
          <Text style={styles.recipeTitle}>Some Fresh New Recs</Text>
        </View>

        <Text style={styles.sectionTitle}>Cuisines You Love</Text>
        <View style={styles.cuisineContainer}>
          <TouchableOpacity style={styles.cuisineButton}>
            <Image
              source={{
                uri: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Flag_of_Greece.svg/1200px-Flag_of_Greece.svg.png",
              }}
              style={styles.flagImage}
            />
            <Text style={styles.cuisineText}>Greek</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cuisineButton}>
            <Image
              source={{
                uri: "https://upload.wikimedia.org/wikipedia/en/thumb/0/03/Flag_of_Italy.svg/1200px-Flag_of_Italy.svg.png",
              }}
              style={styles.flagImage}
            />
            <Text style={styles.cuisineText}>Italian</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cuisineButton}>
            <Image
              source={{
                uri: "https://upload.wikimedia.org/wikipedia/en/thumb/b/ba/Flag_of_Germany.svg/1200px-Flag_of_Germany.svg.png",
              }}
              style={styles.flagImage}
            />
            <Text style={styles.cuisineText}>German</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cuisineButton}>
            <Image
              source={{
                uri: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Flag_of_Thailand.svg/1200px-Flag_of_Thailand.svg.png",
              }}
              style={styles.flagImage}
            />
            <Text style={styles.cuisineText}>Thai</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Log Out</Text>
      </TouchableOpacity>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    paddingTop: 50
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 25,
    paddingHorizontal: 15,
    margin: 15,
    backgroundColor: "#F5F5F5",
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    padding: 10,
    fontSize: 16,
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  tabButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 5,
  },
  tabText: {
    marginLeft: 5,
    fontSize: 16,
  },
  content: {
    flex: 1,
    padding: 15,
  },
  recipeCard: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 20,
  },
  recipeImage: {
    width: "100%",
    height: "100%",
  },
  recipeTitle: {
    position: "absolute",
    bottom: 10,
    left: 10,
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  cuisineContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
  },
  cuisineButton: {
    alignItems: "center",
    width: "22%",
  },
  flagImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginBottom: 5,
  },
  cuisineText: {
    fontSize: 14,
  },
  logoutButton: {
    backgroundColor: "#FF3B30",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginHorizontal: 15,
    marginBottom: 20,
  },
  logoutButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  }
})