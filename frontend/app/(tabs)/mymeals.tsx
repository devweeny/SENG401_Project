"use client"
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, TextInput, ScrollView, ActivityIndicator, Modal } from "react-native"
import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import React, { useEffect, useState } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native"
import StarRating from 'react-native-star-rating-widget';

// Define recipe type
interface Recipe {
  title: string;
  prepTime: string; 
  cookTime: string;
  difficulty: string;
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
  const [ratings, setRatings] = useState<{ [title: string]: number }>({});

  const router = useRouter();

  useFocusEffect(
    React.useCallback(() => {
      loadSavedRecipes();
    }, [])
  );

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


  useEffect(() => {
    const loadRatings = async () => {
      try {
        const savedRatings = await AsyncStorage.getItem('recipeRatings');
        if (savedRatings) {
          setRatings(JSON.parse(savedRatings));
        }
      } catch (error) {
        console.error("Error loading ratings:", error);
      }
    };

    loadRatings();
  }, []); 

  useEffect(() => {
    const saveRatings = async () => {
      try {
        await AsyncStorage.setItem('recipeRatings', JSON.stringify(ratings));
      } catch (error) {
        console.error("Error saving ratings:", error);
      }
    };

    saveRatings();
  }, [ratings]);

  const loadSavedRecipes = async () => {
    try {
      setIsLoading(true);
      
      const token = await AsyncStorage.getItem("token"); // Retrieve JWT token if required
      let recipes = [];
  
      const response = await fetch("https://seng401.devweeny.ca/get_recipes", {
        //This needs to be changed to the appropriate backend link
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (response.ok) {
        const data = await response.json();
        recipes = data.recipes; // Ensure backend returns { recipes: [...] }
        if (recipes[0].name) {
          recipes = recipes.map((recipe: any) => {
            return {
              title: recipe.name,
              prepTime: recipe.prepTime,
              cookTime: recipe.cookTime,
              difficulty: recipe.difficulty,
              ingredients: recipe.ingredients,
              instructions: recipe.instructions,
              source: recipe.source,
            };
          });
        }
        await AsyncStorage.setItem("likedRecipes", JSON.stringify(recipes)); // Save to local storage
      } else {
        console.warn("Failed to fetch from backend, falling back to local storage.");
        const savedJson = await AsyncStorage.getItem("likedRecipes");
        if (savedJson) {
          recipes = JSON.parse(savedJson);
        }
      }
  
      setSavedRecipes(recipes);
      setFilteredRecipes(recipes);
    } catch (error) {
      console.error("Error loading saved recipes:", error);
      // If an error occurs, still attempt to load from local storage
      const savedJson = await AsyncStorage.getItem("likedRecipes");
      if (savedJson) {
        const recipes = JSON.parse(savedJson);
        setSavedRecipes(recipes);
        setFilteredRecipes(recipes);
      } 
    } finally {
      setIsLoading(false);
    }
  };

  // Inside the render method
  // console.log("Filtered Recipes:", filteredRecipes); // Debugging log

  const handleRatingChange = (title: string, rating: number) => {
    setRatings(prevRatings => ({
      ...prevRatings,
      [title]: rating,
    }));
  };

const handleRemoveRecipe = async (recipeToRemove: Recipe) => {
  try {
    const token = await AsyncStorage.getItem("token"); // Retrieve JWT token if required

    const response = await fetch("https://seng401.devweeny.ca/remove_recipe", {
      //This needs to be changed to the appropriate backend link
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({recipe_name: recipeToRemove.title}),
    });

    if (!response.ok) {
      console.error("Failed to remove recipe from backend")
      return;
    }
    const updatedRecipes = savedRecipes.filter((recipe) => recipe.title !== recipeToRemove.title);

    setSavedRecipes(updatedRecipes);
    await AsyncStorage.setItem("likedRecipes", JSON.stringify(updatedRecipes));
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
          <ActivityIndicator testID="loading-indicator" size="large" color="#FF6B6B" />
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
        <Ionicons
          name="search"
          size={20}
          color="#888"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search recipes or ingredients"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === "favorites" && styles.activeTabButton,
          ]}
          onPress={() => setActiveTab("favorites")}
        >
          <Ionicons
            name="heart"
            size={20}
            color={activeTab === "favorites" ? "#FF6B6B" : "#000"}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === "favorites" && styles.activeTabText,
            ]}
          >
            Favorites
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {filteredRecipes.length > 0 ? (
          filteredRecipes.map((recipe, index) => (
            <View key={index} style={styles.recipeCard}>
              <View style={styles.recipeHeader}>
                <Text style={styles.recipeTitle}>
                  {recipe.title || "No title"}
                </Text>
              </View>

              <View style={styles.recipeContent}>
                <View style={styles.inlineContainer}>
  <Text style={styles.boldText}>Prep Time: </Text>
  <Text style={styles.inlineText}>10 minutes</Text>
</View>

<View style={styles.inlineContainer}>
  <Text style={styles.boldText}>Cook Time: </Text>
  <Text style={styles.inlineText}>30 minutes</Text>
</View>

<View style={styles.inlineContainer}>
  <Text style={styles.boldText}>Difficulty: </Text>
  <Text style={styles.inlineText}>Easy</Text>
</View>
                <Text style={styles.sectionTitle}>Ingredients:</Text>
                {recipe.ingredients.slice(0, 3).map((ingredient, idx) => (
                  <Text key={idx} style={styles.ingredientText}>
                    • {ingredient}
                  </Text>
                ))}
                {recipe.ingredients.length > 3 && (
                  <Text style={styles.moreText}>
                    +{recipe.ingredients.length - 3} more ingredients
                  </Text>
                )}

                {/* Star Rating */}
                <StarRating
                  testID="star-rating-widget" // Added testID for testing
                  rating={ratings[recipe.title] || 0} // Default to 0 if no rating exists
                  onChange={(rating) =>
                    handleRatingChange(recipe.title, rating)
                  }
                  maxStars={5}
                  starSize={20}
                  color="#FFD700" // Gold color for stars
                />

                <View style={styles.recipeActions}>
                  <TouchableOpacity
                    style={styles.viewButton}
                    onPress={() => handleViewRecipe(recipe)}
                  >
                    <Text style={styles.viewButtonText}>View Full Recipe</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    testID="remove-button" // Added testID for the remove button
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
              {searchQuery
                ? "No recipes match your search"
                : "No saved recipes yet"}
            </Text>
            <TouchableOpacity
              style={styles.findRecipesButton}
              onPress={() => router.push("/(tabs)/ingredients")}
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

                <View style={styles.inlineContainer}>
                  <Text style={styles.boldText}>Prep Time: </Text>
                  <Text style={styles.inlineText}>10 minutes</Text>
                </View>

                <View style={styles.inlineContainer}>
                  <Text style={styles.boldText}>Cook Time: </Text>
                  <Text style={styles.inlineText}>30 minutes</Text>
                </View>

                <View style={styles.inlineContainer}>
                  <Text style={styles.boldText}>Difficulty: </Text>
                  <Text style={styles.inlineText}>Easy</Text>
                </View>

                <Text style={styles.modalSectionTitle}>Ingredients:</Text>
                {selectedRecipe.ingredients.map((ingredient, idx) => (
                  <Text key={idx} style={styles.modalIngredientText}>
                    • {ingredient}
                  </Text>
                ))}

                <Text style={styles.modalSectionTitle}>Instructions:</Text>
                {selectedRecipe.instructions.map((instruction, idx) => (
                  <Text key={idx} style={styles.modalInstructionText}>
                    {idx + 1}. {instruction}
                  </Text>
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
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
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "90%",
    height: "80%",
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.25)",
    elevation: 5,
  },
  closeButton: {
    alignSelf: "flex-end",
    padding: 5,
  },
  modalScrollView: {
    flex: 1,
    marginTop: 10,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FF6B6B",
    marginBottom: 20,
    textAlign: "center",
  },
  modalSectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 15,
    marginBottom: 10,
    color: "#333",
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
    fontStyle: "italic",
    color: "#888",
    marginTop: 20,
    marginBottom: 30,
  },
  inlineContainer: {
    flexDirection: "row", 
    alignItems: "center", 
    marginBottom: 5, 
  },
  boldText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
  },
  inlineText: {
    fontSize: 16,
    color: "#555",
  },
});