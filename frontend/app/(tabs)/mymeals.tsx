"use client"
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, TextInput, ScrollView, ActivityIndicator, Modal } from "react-native"
import { router } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import React, { useState, useEffect } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage";

// Define recipe type
interface Recipe {
  title: string;
  ingredients: string[];
  instructions: string[];
  source: string;
}

export default function MyMealsScreen() {
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("favorites");
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    loadSavedRecipes();
  }, []);

  useEffect(() => {
    // Filter recipes when search query changes
    if (searchQuery) {
      const filtered = savedRecipes.filter(recipe => 
        recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recipe.ingredients.some(ing => ing.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredRecipes(filtered);
    } else {
      setFilteredRecipes(savedRecipes);
    }
  }, [searchQuery, savedRecipes]);

  const loadSavedRecipes = async () => {
    try {
      const savedJson = await AsyncStorage.getItem('likedRecipes');
      if (savedJson) {
        const recipes = JSON.parse(savedJson);
        setSavedRecipes(recipes);
        setFilteredRecipes(recipes);
      }
    } catch (error) {
      console.error("Error loading saved recipes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveRecipe = async (recipeToRemove: Recipe) => {
    try {
      const updatedRecipes = savedRecipes.filter(recipe => recipe.title !== recipeToRemove.title);
      setSavedRecipes(updatedRecipes);
      await AsyncStorage.setItem('likedRecipes', JSON.stringify(updatedRecipes));
    } catch (error) {
      console.error("Error removing recipe:", error);
    }
  };

  const handleViewRecipe = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setModalVisible(true);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6B6B" />
          <Text style={styles.loadingText}>Loading saved recipes...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Saved Recipes</Text>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
        <TextInput 
          style={styles.searchInput} 
          placeholder="Search recipes or ingredients" 
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === "favorites" && styles.activeTabButton]}
          onPress={() => setActiveTab("favorites")}
        >
          <Ionicons name="heart" size={20} color={activeTab === "favorites" ? "#FF6B6B" : "#000"} />
          <Text style={[styles.tabText, activeTab === "favorites" && styles.activeTabText]}>Favorites</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {filteredRecipes.length > 0 ? (
          filteredRecipes.map((recipe, index) => (
            <View key={index} style={styles.recipeCard}>
              <View style={styles.recipeHeader}>
                <Text style={styles.recipeTitle}>{recipe.title}</Text>
              </View>
              
              <View style={styles.recipeContent}>
                <Text style={styles.sectionTitle}>Ingredients:</Text>
                {recipe.ingredients.slice(0, 3).map((ingredient, idx) => (
                  <Text key={idx} style={styles.ingredientText}>• {ingredient}</Text>
                ))}
                {recipe.ingredients.length > 3 && (
                  <Text style={styles.moreText}>+{recipe.ingredients.length - 3} more ingredients</Text>
                )}
                
                <View style={styles.recipeActions}>
                  <TouchableOpacity 
                    style={styles.viewButton}
                    onPress={() => handleViewRecipe(recipe)}
                  >
                    <Text style={styles.viewButtonText}>View Full Recipe</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.removeButton}
                    onPress={() => handleRemoveRecipe(recipe)}
                  >
                    <Ionicons name="trash-outline" size={18} color="#FF3B30" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="heart-outline" size={60} color="#DDD" />
            <Text style={styles.emptyStateText}>
              {searchQuery ? "No recipes match your search" : "No saved recipes yet"}
            </Text>
            <TouchableOpacity 
              style={styles.findRecipesButton}
              onPress={() => router.push('/(tabs)/ingredients')}
            >
              <Text style={styles.findRecipesButtonText}>Find Recipes</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Recipe Detail Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Ionicons name="close" size={24} color="#888" />
            </TouchableOpacity>
            
            {selectedRecipe && (
              <ScrollView style={styles.modalScrollView}>
                <Text style={styles.modalTitle}>{selectedRecipe.title}</Text>
                
                <Text style={styles.modalSectionTitle}>Ingredients:</Text>
                {selectedRecipe.ingredients.map((ingredient, idx) => (
                  <Text key={idx} style={styles.modalIngredientText}>• {ingredient}</Text>
                ))}
                
                <Text style={styles.modalSectionTitle}>Instructions:</Text>
                {selectedRecipe.instructions.map((instruction, idx) => (
                  <Text key={idx} style={styles.modalInstructionText}>
                    {idx + 1}. {instruction}
                  </Text>
                ))}
                
                <Text style={styles.modalSourceText}>Source: {selectedRecipe.source}</Text>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
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
    marginTop: 10,
    color: "#888",
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 10,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
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
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  activeTabButton: {
    backgroundColor: "#FFF0F0",
  },
  tabText: {
    marginLeft: 5,
    fontSize: 16,
  },
  activeTabText: {
    color: "#FF6B6B",
    fontWeight: "600",
  },
  content: {
    flex: 1,
    padding: 15,
  },
  recipeCard: {
    backgroundColor: "white",
    borderRadius: 10,
    marginBottom: 15,
    overflow: "hidden",
    boxShadow: "0px 1px 2px rgba(0, 0, 0, 0.1)",
    elevation: 2,
  },
  recipeHeader: {
    backgroundColor: "#FF6B6B",
    padding: 15,
  },
  recipeTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  recipeContent: {
    padding: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  ingredientText: {
    fontSize: 14,
    marginBottom: 5,
  },
  moreText: {
    fontSize: 12,
    color: "#888",
    fontStyle: "italic",
    marginTop: 5,
  },
  recipeActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 15,
  },
  viewButton: {
    backgroundColor: "#4A90E2",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  viewButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  removeButton: {
    padding: 8,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#888",
    textAlign: "center",
    marginTop: 20,
    marginBottom: 20,
  },
  findRecipesButton: {
    backgroundColor: "#FF6B6B",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
  },
  findRecipesButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    height: '80%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.25)',
    elevation: 5,
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 5,
  },
  modalScrollView: {
    flex: 1,
    marginTop: 10,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B6B',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 10,
    color: '#333',
  },
  modalIngredientText: {
    fontSize: 16,
    marginBottom: 8,
    paddingLeft: 10,
  },
  modalInstructionText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 10,
    paddingLeft: 10,
  },
  modalSourceText: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#888',
    marginTop: 20,
    marginBottom: 30,
  },
});