import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, Animated, PanResponder, Image, Dimensions, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

// Mock data for recipes
const RECIPES = [
  {
    id: 1,
    title: 'Chicken Fajitas',
    image: require('@/assets/images/chicken-fajitas.jpg'),
    prepTime: '20 min',
    cookTime: '15 min',
    ingredients: ['Chicken breast', 'Bell peppers', 'Onions', 'Fajita seasoning', 'Tortillas'],
    difficulty: 'Easy',
    description: 'Quick and flavorful Mexican-inspired dish with sizzling chicken and colorful vegetables.'
  },
  {
    id: 2,
    title: 'Spaghetti Carbonara',
    image: require('@/assets/images/carbonara.jpg'),
    prepTime: '10 min',
    cookTime: '20 min',
    ingredients: ['Spaghetti', 'Eggs', 'Bacon', 'Parmesan cheese', 'Black pepper'],
    difficulty: 'Medium',
    description: 'Classic Italian pasta dish with creamy egg sauce, crispy bacon and parmesan cheese.'
  },
  {
    id: 3,
    title: 'Vegetable Stir-Fry',
    image: require('@/assets/images/stir-fry.jpg'),
    prepTime: '15 min',
    cookTime: '10 min',
    ingredients: ['Broccoli', 'Bell peppers', 'Carrots', 'Soy sauce', 'Garlic', 'Ginger'],
    difficulty: 'Easy',
    description: 'Healthy and colorful vegetable dish that comes together in minutes.'
  }
];

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = 120;

export default function SwipeScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likedRecipes, setLikedRecipes] = useState<number[]>([]);
  const position = useRef(new Animated.ValueXY()).current;
  const rotation = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: ['-10deg', '0deg', '10deg'],
    extrapolate: 'clamp'
  });

  useEffect(() => {
    // In a real app, you would fetch recipes based on selected ingredients
    // For now, we'll just load the mock data
    const loadData = async () => {
      const savedLikedRecipes = await AsyncStorage.getItem('likedRecipes');
      if (savedLikedRecipes) {
        setLikedRecipes(JSON.parse(savedLikedRecipes));
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
    const recipe = RECIPES[currentIndex];
    const newLikedRecipes = [...likedRecipes, recipe.id];
    setLikedRecipes(newLikedRecipes);
    AsyncStorage.setItem('likedRecipes', JSON.stringify(newLikedRecipes));
    
    Animated.timing(position, {
      toValue: { x: SCREEN_WIDTH + 100, y: 0 },
      duration: 250,
      useNativeDriver: false
    }).start(() => {
      nextCard();
    });
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

  // Render out of cards view
  if (currentIndex >= RECIPES.length) {
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
          onPress={() => router.push('/mymeals')}
        >
          <ThemedText style={styles.viewSavedButtonText}>
            View Saved Recipes ({likedRecipes.length})
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.viewSavedButton, styles.newSearchButton]} 
          onPress={() => router.push('/ingredients')}
        >
          <ThemedText style={styles.viewSavedButtonText}>
            New Search
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  const recipe = RECIPES[currentIndex];

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Find Recipes</ThemedText>
        <ThemedView style={styles.actionButtons}>
          <TouchableOpacity onPress={() => router.push('/ingredients')}>
            <ThemedText style={styles.backButton}>Back to Ingredients</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/mymeals')}>
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
          <Image source={recipe.image} style={styles.recipeImage} />
          
          <ThemedView style={styles.recipeDetails}>
            <ThemedText type="title" style={styles.recipeTitle}>{recipe.title}</ThemedText>
            
            <ThemedView style={styles.recipeMetadata}>
              <ThemedView style={styles.metadataItem}>
                <ThemedText style={styles.metadataLabel}>Prep Time</ThemedText>
                <ThemedText style={styles.metadataValue}>{recipe.prepTime}</ThemedText>
              </ThemedView>
              <ThemedView style={styles.metadataItem}>
                <ThemedText style={styles.metadataLabel}>Cook Time</ThemedText>
                <ThemedText style={styles.metadataValue}>{recipe.cookTime}</ThemedText>
              </ThemedView>
              <ThemedView style={styles.metadataItem}>
                <ThemedText style={styles.metadataLabel}>Difficulty</ThemedText>
                <ThemedText style={styles.metadataValue}>{recipe.difficulty}</ThemedText>
              </ThemedView>
            </ThemedView>
            
            <ThemedText style={styles.description}>{recipe.description}</ThemedText>
            
            <ThemedText type="defaultSemiBold" style={styles.ingredientsTitle}>
              Ingredients:
            </ThemedText>
            <ThemedView style={styles.ingredientsList}>
              {recipe.ingredients.map((ingredient, index) => (
                <ThemedView key={index} style={styles.ingredientItem}>
                  <ThemedText style={styles.ingredientText}>• {ingredient}</ThemedText>
                </ThemedView>
              ))}
            </ThemedView>
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
  recipeImage: {
    width: '100%',
    height: 220,
    resizeMode: 'cover',
  },
  recipeDetails: {
    padding: 20,
  },
  recipeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  recipeMetadata: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 15,
  },
  metadataItem: {
    alignItems: 'center',
  },
  metadataLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 3,
  },
  metadataValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  description: {
    marginBottom: 15,
    lineHeight: 20,
    fontSize: 15,
  },
  ingredientsTitle: {
    marginBottom: 5,
  },
  ingredientsList: {
    marginBottom: 15,
  },
  ingredientItem: {
    marginVertical: 3,
  },
  ingredientText: {
    fontSize: 14,
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