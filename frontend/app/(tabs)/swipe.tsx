import React, { useState, useRef } from 'react';
import { StyleSheet, Animated, PanResponder, View, Dimensions, TouchableOpacity, ActivityIndicator, ScrollView, Text } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from '@react-navigation/native';
import { Alert } from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = 120;

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

export default function SwipeScreen() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likedRecipes, setLikedRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const position = useRef(new Animated.ValueXY()).current;
  const rotation = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: ['-10deg', '0deg', '10deg'],
    extrapolate: 'clamp'
  });
  const router = useRouter();
  const loadData = async () => {
    try {
      // Load generated recipes
      const recipesJson = await AsyncStorage.getItem("generatedRecipes");
      let loadedRecipes: Recipe[] = recipesJson
        ? JSON.parse(recipesJson)
        : [];
      console.log("Recipes from storage:", loadedRecipes);
      
      setRecipes(loadedRecipes);
      if (loadedRecipes.length > 0) {
        setCurrentIndex(0);
        await AsyncStorage.removeItem("generatedRecipes");
      }

      // Load saved recipes
      const savedJson = await AsyncStorage.getItem("likedRecipes");
      const savedRecipes: Recipe[] = savedJson
        ? JSON.parse(savedJson)
        : [];
      for (let i = 0; i < savedRecipes.length; i++) {
        if (!savedRecipes[i].title) savedRecipes[i].title = "Unknown Title";
        if (!savedRecipes[i].prepTime) savedRecipes[i].prepTime = "N/A";
        if (!savedRecipes[i].cookTime) savedRecipes[i].cookTime = "N/A";
        if (!savedRecipes[i].difficulty) savedRecipes[i].difficulty = "N/A";
        if (!savedRecipes[i].ingredients) savedRecipes[i].ingredients = ["No ingredients listed"];
        if (!savedRecipes[i].instructions) savedRecipes[i].instructions = ["No instructions provided"];
        if (!savedRecipes[i].source) savedRecipes[i].source = "Unknown Source";
      }
      setLikedRecipes(savedRecipes);
    } catch (error) {
      console.error("Error loading recipes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {

    
      loadData();
    }, []));

    useFocusEffect(
      React.useCallback(() => {
        loadData().then(() => console.log("Loaded recipes:", recipes));
      }, [])
    );
    

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gesture) => {
      position.setValue({ x: gesture.dx, y: gesture.dy });
    },
    onPanResponderRelease: (_, gesture) => {
      if (gesture.dx > SWIPE_THRESHOLD) {
        swipeRight();
      } else if (gesture.dx < -SWIPE_THRESHOLD) {
        swipeLeft();
      } else {
        resetPosition();
      }
    }
  });

  const resetPosition = () => {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      friction: 4,
      useNativeDriver: false
    }).start();
  };

  const swipeRight = async () => {
    if (currentIndex < recipes.length) {
      console.log("swipeRight called");
      Alert.alert("Saved", "Recipe added to favorites.");
    
      const recipe = recipes[currentIndex];
  
      try {
        // Get the user token
        const token = await AsyncStorage.getItem('token'); 
  
        // Send the liked recipe to the backend
        const response = await fetch('https://seng401.devweeny.ca/add_recipe', { //This needs to be changed to the appropriate backend link
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(recipe),
        });
  
        if (!response.ok) {
          throw new Error('Failed to save recipe');
        }
  
        const newLikedRecipes = [...likedRecipes, recipe];
        setLikedRecipes(newLikedRecipes);
        await AsyncStorage.setItem('likedRecipes', JSON.stringify(newLikedRecipes));
  
        Animated.timing(position, {
          toValue: { x: SCREEN_WIDTH + 100, y: 0 },
          duration: 250,
          useNativeDriver: false,
        }).start(() => {
          nextCard();
        });
      } catch (error) {
        console.error('Error saving recipe:', error);
      }
    }
  };
  

  const swipeLeft = () => {
    if (currentIndex < recipes.length) {
      const recipe = recipes[currentIndex];
      console.log("Recipe discarded:", recipe.title);
      
      Animated.timing(position, {
        toValue: { x: -SCREEN_WIDTH - 100, y: 0 },
        duration: 250,
        useNativeDriver: false
      }).start(() => {
        nextCard();
      });
    }
  };

  const nextCard = () => {
    position.setValue({ x: 0, y: 0 });
    setCurrentIndex(currentIndex + 1);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B6B" />
        <Text style={{ marginTop: 20, color: "#333" }}>Loading recipes...</Text>
      </View>
    );
  }

  // Render out of cards view
  if (currentIndex >= recipes.length) {
    return (
      <View style={styles.noMoreCards}>
        <Text style={styles.noMoreCardsText}>
          No more recipes!
        </Text>
        <Text style={styles.noMoreCardsSubtext}>
          You've seen all the matching recipes.
        </Text>
        <TouchableOpacity 
          style={styles.viewSavedButton} 
          onPress={() => router.push('/(tabs)/mymeals')}
        >
          <Text style={styles.viewSavedButtonText}>
            View Saved Recipes ({likedRecipes.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.viewSavedButton, styles.newSearchButton]} 
          onPress={() => router.push('/(tabs)/ingredients')}
        >
          <Text style={styles.viewSavedButtonText}>
            New Search
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const recipe: Recipe = recipes[currentIndex] || {
    title: "Unknown Title",
    prepTime: "N/A",
    cookTime: "N/A",
    difficulty: "N/A",
    ingredients: ["No ingredients listed"],
    instructions: ["No instructions provided"],
    source: "Unknown Source"
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Find Recipes</Text>
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.push('/(tabs)/ingredients')}
          >
            <Ionicons name="arrow-back" size={20} color="#888" />
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.savedButton}
            onPress={() => router.push('/(tabs)/mymeals')}
          >
            <Text style={styles.savedButtonText}>
              Saved ({likedRecipes.length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.cardContainer}>
        <Animated.View 
          {...panResponder.panHandlers}
          style={[
            styles.card,
            {
              transform: [
                { translateX: position.x },
                { translateY: position.y },
                { rotate: rotation }
              ]
            }
          ]}
        >
          <View style={styles.recipeHeader}>
            <Text style={styles.recipeTitle}>{recipe.title}</Text>
          </View>
          
          <ScrollView style={styles.recipeDetails}>
            <View style = {styles.recipeInfo}>
              <Text style={styles.recipeInfo}>Preparation Time: {recipe.prepTime}</Text>

              <Text style={styles.recipeInfo}>Cooking Time: {recipe.cookTime}</Text>

              <Text style={styles.recipeInfo}>Difficulty Level: {recipe.difficulty}</Text>
            </View>
            

            <Text style={styles.sectionTitle}>
              Ingredients:
            </Text>
            <View style={styles.ingredientsList}>
              {recipe.ingredients.map((ingredient, index) => (
                <View key={index} style={styles.ingredientItem}>
                  <Text style={styles.ingredientText}>• {ingredient}</Text>
                </View>
              ))}
            </View>
            
            <Text style={styles.sectionTitle}>
              Instructions:
            </Text>
            <View style={styles.instructionsList}>
              {recipe.instructions.map((instruction, index) => (
                <View key={index} style={styles.instructionItem}>
                  <Text style={styles.instructionText}>{index + 1}. {instruction}</Text>
                </View>
              ))}
            </View>
            
            <Text style={styles.sourceText}>Source: {recipe.source}</Text>
            
            {/* Add extra padding at bottom for scroll */}
            <View style={{ height: 20 }} />
          </ScrollView>
        </Animated.View>
      </View>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={styles.skipButton}
          onPress={swipeLeft}
          testID="skipButton" // Added testID for testing
        >
          <Ionicons name="close-outline" size={24} color="#666" />
          <Text style={styles.skipButtonText}>Skip</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.likeButton} onPress={swipeRight}>
          <Ionicons name="heart-outline" size={24} color="white" />
          <Text style={styles.likeButtonText}>Save</Text>
        </TouchableOpacity>
        {/* <TouchableOpacity style={styles.removeButton} onPress={}>
          <Ionicons name="trash-outline" size={24} color="white" />
          <Text style={styles.removeButtonText}>Remove</Text>
        </TouchableOpacity> */}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  header: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButtonText: {
    color: '#888',
    fontSize: 16,
    marginLeft: 5,
  },
  savedButton: {
    backgroundColor: '#FFF0F0',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 15,
  },
  savedButtonText: {
    color: '#FF6B6B',
    fontSize: 16,
    fontWeight: '600',
  },
  cardContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  card: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
    backgroundColor: 'white',
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 5,
    overflow: 'hidden',
  },
  recipeHeader: {
    padding: 20,
    backgroundColor: '#FF6B6B',
    alignItems: 'center',
  },
  recipeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  recipeDetails: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 10,
    color: '#333',
  },
  recipeInfo: {
    fontSize: 16,
    color: '#333',
    marginBottom: 6,
    fontStyle: 'italic',
  },  
  ingredientsList: {
    marginBottom: 20,
  },
  ingredientItem: {
    marginVertical: 3,
  },
  ingredientText: {
    fontSize: 16,
    color: '#333',
  },
  instructionsList: {
    marginBottom: 20,
  },
  instructionItem: {
    marginVertical: 5,
  },
  instructionText: {
    fontSize: 16,
    lineHeight: 22,
    color: '#333',
  },
  sourceText: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#888',
    marginTop: 10,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 30,
    paddingTop: 10,
  },
  skipButton: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 30,
    width: '48%',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  skipButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
    marginLeft: 5,
  },
  likeButton: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 30,
    width: '48%',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  likeButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
    marginLeft: 5,
  },
  noMoreCards: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
    backgroundColor: 'white',
  },
  noMoreCardsText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#333',
  },
  noMoreCardsSubtext: {
    textAlign: 'center',
    color: '#888',
    marginBottom: 30,
    fontSize: 16,
  },
  viewSavedButton: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginBottom: 15,
  },
  newSearchButton: {
    backgroundColor: '#4A90E2',
  },
  viewSavedButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  removeButton: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 30,
    width: '48%',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  removeButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
    marginLeft: 5,
  },
});