import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, Animated, PanResponder, View, Dimensions, TouchableOpacity, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

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
          // You could set some fallback recipes here or redirect
          router.replace('/(tabs)/ingredients');
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
        setIsLoading(false);
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
    Animated.timing(position, {
      toValue: { x: -SCREEN_WIDTH - 100, y: 0 },
      duration: 250,
      useNativeDriver: false
    }).start(() => {
      nextCard();
    });
  };

  const nextCard = () => {
    position.setValue({ x: 0, y: 0 });
    setCurrentIndex(currentIndex + 1);
  };

  if (isLoading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B6B" />
        <ThemedText style={{ marginTop: 20 }}>Loading recipes...</ThemedText>
      </ThemedView>
    );
  }

  // Render out of cards view
  if (currentIndex >= recipes.length) {
    return (
      <ThemedView style={styles.noMoreCards}>
        <ThemedText type="title" style={styles.noMoreCardsText}>
          No more recipes!
        </ThemedText>
        <ThemedText style={styles.noMoreCardsSubtext}>
          You've seen all the matching recipes.
        </ThemedText>
        <TouchableOpacity 
          style={styles.viewSavedButton} 
          onPress={() => router.push('/(tabs)/mymeals')}
        >
          <ThemedText style={styles.viewSavedButtonText}>
            View Saved Recipes ({likedRecipes.length})
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.viewSavedButton, styles.newSearchButton]} 
          onPress={() => router.push('/(tabs)/ingredients')}
        >
          <ThemedText style={styles.viewSavedButtonText}>
            New Search
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  const recipe = recipes[currentIndex];

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Find Recipes</ThemedText>
        <ThemedView style={styles.actionButtons}>
          <TouchableOpacity onPress={() => router.push('/(tabs)/ingredients')}>
            <ThemedText style={styles.backButton}>Back to Ingredients</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/(tabs)/mymeals')}>
            <ThemedText style={styles.savedButton}>
              Saved ({likedRecipes.length})
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ThemedView>

      <ThemedView style={styles.cardContainer}>
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
          <ThemedView style={styles.recipeHeader}>
            <ThemedText type="title" style={styles.recipeTitle}>{recipe.title}</ThemedText>
          </ThemedView>
          
          <ThemedView style={styles.recipeDetails}>
            <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
              Ingredients:
            </ThemedText>
            <ThemedView style={styles.ingredientsList}>
              {recipe.ingredients.map((ingredient, index) => (
                <ThemedView key={index} style={styles.ingredientItem}>
                  <ThemedText style={styles.ingredientText}>• {ingredient}</ThemedText>
                </ThemedView>
              ))}
            </ThemedView>
            
            <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
              Instructions:
            </ThemedText>
            <ThemedView style={styles.instructionsList}>
              {recipe.instructions.map((instruction, index) => (
                <ThemedView key={index} style={styles.instructionItem}>
                  <ThemedText style={styles.instructionText}>{index + 1}. {instruction}</ThemedText>
                </ThemedView>
              ))}
            </ThemedView>
            
            <ThemedText style={styles.sourceText}>Source: {recipe.source}</ThemedText>
          </ThemedView>
        </Animated.View>
      </ThemedView>

      <ThemedView style={styles.buttonsContainer}>
        <TouchableOpacity style={styles.skipButton} onPress={swipeLeft}>
          <ThemedText style={styles.skipButtonText}>Skip</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.likeButton} onPress={swipeRight}>
          <ThemedText style={styles.likeButtonText}>Save</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  backButton: {
    color: '#888',
    fontSize: 16,
  },
  savedButton: {
    color: '#FF6B6B',
    fontSize: 16,
    fontWeight: '600',
  },
  cardContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  card: {
    width: SCREEN_WIDTH - 40,
    maxHeight: 600,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  recipeHeader: {
    padding: 20,
    backgroundColor: '#FF6B6B',
  },
  recipeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  recipeDetails: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    marginTop: 10,
    marginBottom: 5,
  },
  ingredientsList: {
    marginBottom: 20,
  },
  ingredientItem: {
    marginVertical: 3,
  },
  ingredientText: {
    fontSize: 16,
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
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  skipButton: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    width: '48%',
    alignItems: 'center',
  },
  skipButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  likeButton: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    width: '48%',
    alignItems: 'center',
  },
  likeButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
  noMoreCards: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  noMoreCardsText: {
    marginBottom: 10,
    textAlign: 'center',
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