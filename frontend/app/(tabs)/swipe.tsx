import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, Animated, PanResponder, View, Dimensions, TouchableOpacity, ActivityIndicator, ScrollView, Text, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from "@expo/vector-icons";
import { act } from 'react-test-renderer';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = 120;

// Define recipe type
interface Recipe {
  title: string;
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

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load generated recipes
        const recipesJson = await AsyncStorage.getItem('generatedRecipes');
        let loadedRecipes: Recipe[] = [];
        
        if (recipesJson) {
          loadedRecipes = JSON.parse(recipesJson);
        }
        
        // If no recipes were loaded, show dummy data or redirect back
        if (!loadedRecipes || loadedRecipes.length === 0) {
          console.log("No recipes found, using fallback");
          // Redirect back to ingredients
          act(() => {
            router.replace('/(tabs)/ingredients');
          });
          return;
        }
        
        setRecipes(loadedRecipes);
        
        // Load saved recipes
        const savedJson = await AsyncStorage.getItem('likedRecipes');
        if (savedJson) {
          setLikedRecipes(JSON.parse(savedJson));
        }
      } catch (error) {
        console.error("Error loading recipes:", error);
      } finally {
        act(() => {
          setIsLoading(false);
        });
      }
    };
    
    loadData();
  }, []);

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

  const swipeRight = () => {
    if (currentIndex < recipes.length) {
      const recipe = recipes[currentIndex];
      const newLikedRecipes = [...likedRecipes, recipe];
      setLikedRecipes(newLikedRecipes);
      AsyncStorage.setItem('likedRecipes', JSON.stringify(newLikedRecipes));
      console.log("Recipe saved:", recipe.title);
      Alert.alert("Saved", "Recipe added to favorites.");
      
      Animated.timing(position, {
        toValue: { x: SCREEN_WIDTH + 100, y: 0 },
        duration: 250,
        useNativeDriver: false
      }).start(() => {
        nextCard();
      });
    }
  };

  const swipeLeft = () => {
    if (currentIndex < recipes.length) {
      const recipe = recipes[currentIndex];
      console.log("Recipe discarded:", recipe.title);
      Alert.alert("Discarded", "Recipe removed.");
      
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

  const recipe = recipes[currentIndex];

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
        <TouchableOpacity style={styles.skipButton} onPress={swipeLeft}>
          <Ionicons name="close-outline" size={24} color="#666" />
          <Text style={styles.skipButtonText}>Skip</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.likeButton} onPress={swipeRight}>
          <Ionicons name="heart-outline" size={24} color="white" />
          <Text style={styles.likeButtonText}>Save</Text>
        </TouchableOpacity>
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
});