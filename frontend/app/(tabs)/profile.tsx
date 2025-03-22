import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { Image } from "react-native";

export default function ProfileScreen() {
  const [userData, setUserData] = useState<{
    email?: string;
    name?: string;
    guest?: boolean;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ADDED FOR FR 3
  const [name, setName] = useState(userData?.name || "");
  const [email, setEmail] = useState(userData?.email || "");
  const [password, setPassword] = useState("");
  const [dietaryPreferences, setDietaryPreferences] = useState<string[]>([]);

  //toggle form visibility to edit profile
  const [isEditing, setIsEditing] = useState(false);

  // state var to store profile pic URI
  const [profilePicture, setProfilePicture] = useState<string | null>(null);

  const router = useRouter();

  const loadUserData = async () => {
    try {
      // Check if logged in as guest
      const user = await AsyncStorage.getItem("user");
      if (user) {
        const parsedUser = JSON.parse(user);
        setUserData(parsedUser);
        setDietaryPreferences(parsedUser.dietaryPreferences || []);
      } else {
        // If no user data is found, check if a token exists (meaning they logged in but no profile info)
        const token = await AsyncStorage.getItem("token");
        if (token) {
          // User is logged in but we don't have their profile data
          setUserData({ email: "User" });
        } else {
          // Default to guest mode if nothing else
          setUserData({ guest: true });
        }
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      alert("Failed to load user data. Defaulting to guest mode.");
      setUserData({ guest: true });
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {

    loadUserData();
  }, []);

  const handleLogout = async () => {
    try {
      await AsyncStorage.clear();
      alert("You are logged out.");
      router.replace("/login");
    } catch (error) {
      alert("Failed to log out. Please try again.");
    }
  };

  const pickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
      if (!permissionResult.granted) {
        alert("Permission to access the media library is required!");
        return;
      }
    
      // Open the image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1], // Square aspect ratio
        quality: 1, // High quality
      });
    
      if (!result.canceled) {
        setProfilePicture(result.assets[0].uri); // Save the selected image URI
      }
    } catch (error) {
      console.error("Error picking image:", error);
      alert("Failed to pick an image. Please try again.");
    }
  };

  // ADDED
  const toggleDietaryPreference = (preference: string) => {
    setDietaryPreferences((prev) =>
      prev.includes(preference)
        ? prev.filter((item) => item !== preference)
        : [...prev, preference]
    );
  };

  const handleSaveProfile = async () => {
    console.log('handleSave called');
    try {
      const updatedProfile = {
        name,
        email,
        dietaryPreferences,
      };

      try {
        const response = await fetch("https://seng401.devweeny.ca/profile", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${await AsyncStorage.getItem("token")}`,
          },
          body: JSON.stringify(updatedProfile),
        });
        if (!response.ok) {
          throw new Error("Failed to update profile on server");
        }
        const data = await response.json();

        // Save updated user data to AsyncStorage
        await AsyncStorage.setItem("user", JSON.stringify(data));
        
      } catch (error) {
        console.error("Failed to update profile on server:", error);
        alert("Failed to update profile. Please try again."); // Show error alert
      }
      alert("Profile updated successfully!");
      loadUserData();

      // Exit the form after saving changes
      setIsEditing(false);
    } catch (error) {
      alert("Failed to update profile. Please try again.");
    }
  };
  //END OF ADDED

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>
  
        {/* Profile Container */}
        <View style={styles.profileContainer}>
          {/* Profile Picture Section */}
          <View style={styles.avatarContainer}>
            {profilePicture ? (
              <Image source={{ uri: profilePicture }} style={styles.profileImage} />
            ) : (
              <Ionicons name="person-circle" size={120} color="#FF6B6B" />
            )}
  
            <TouchableOpacity
              style={styles.changePfpButton}
              onPress={pickImage}
              testID="changeProfilePictureButton" // Added testID
            >
              <Text style={styles.changePfpButtonText}>Change Profile Picture</Text>
            </TouchableOpacity>
          </View>
  
          {/* User Information */}
          <View style={styles.infoContainer}>
            {userData?.guest ? (
              <Text style={styles.nameText}>Logged in as Guest</Text>
            ) : (
              <>
                <Text style={styles.nameText}>{userData?.name || "User"}</Text>
                <Text style={styles.emailText}>{userData?.email || ""}</Text>
              </>
            )}
          </View>
  
          {/* Update Profile Button */}
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => setIsEditing(!isEditing)}
          >
            <Text style={styles.editButtonText}>
              {isEditing ? "Cancel" : "Update Profile"}
            </Text>
          </TouchableOpacity>
  
          {/* Update Profile Form */}
          {isEditing && (
            <View style={styles.formContainer}>
              <Text style={styles.formLabel}>Name</Text>
              <TextInput
                style={styles.formInput}
                value={name}
                onChangeText={setName}
                placeholder="Enter new name"
              />
  
              <Text style={styles.formLabel}>Email</Text>
              <TextInput
                style={styles.formInput}
                value={email}
                onChangeText={setEmail}
                placeholder="Enter new email"
                keyboardType="email-address"
              />
  
              <Text style={styles.formLabel}>Password</Text>
              <TextInput
                style={styles.formInput}
                value={password}
                onChangeText={setPassword}
                placeholder="Enter a new password"
                secureTextEntry
              />
  
              <Text style={styles.formLabel}>Dietary Preferences</Text>
              <TouchableOpacity
                style={styles.preferenceButton}
                onPress={() => toggleDietaryPreference("Vegetarian")}
              >
                <Text style={styles.preferenceButtonText}>
                  {dietaryPreferences.includes("Vegetarian")
                    ? "Remove Vegetarian"
                    : "Add Vegetarian"}
                </Text>
              </TouchableOpacity>
  
              <TouchableOpacity
                style={styles.preferenceButton}
                onPress={() => toggleDietaryPreference("Vegan")}
              >
                <Text style={styles.preferenceButtonText}>
                  {dietaryPreferences.includes("Vegan") ? "Remove Vegan" : "Add Vegan"}
                </Text>
              </TouchableOpacity>
  
              <TouchableOpacity
                style={styles.preferenceButton}
                onPress={() => toggleDietaryPreference("Gluten-Free")}
              >
                <Text style={styles.preferenceButtonText}>
                  {dietaryPreferences.includes("Gluten-Free")
                    ? "Remove Gluten-Free"
                    : "Add Gluten-Free"}
                </Text>
              </TouchableOpacity>
  
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSaveProfile}
              >
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          )}
  
          {/* Separator */}
          <View style={styles.separator} />
  
          {/* Logout Button */}
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Log Out</Text>
          </TouchableOpacity>
  
          {/* App Version */}
          <Text style={styles.versionText}>MealMatcher v1.0.0</Text>
        </View>
      </ScrollView>
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
    fontSize: 16,
    color: "#888",
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },
  profileContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  infoContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  nameText: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 5,
  },
  emailText: {
    fontSize: 16,
    color: "#888",
  },
  separator: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginBottom: 30,
  },
  logoutButton: {
    backgroundColor: "#FF3B30",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
  },
  logoutButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  versionText: {
    textAlign: "center",
    color: "#888",
    fontSize: 12,
    marginTop: 10,
  },
  //ADDED FOR FR 3
  formContainer: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  formInput: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
  preferenceButton: {
    backgroundColor: "#FF6B6B",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 15,
  },
  preferenceButtonText: {
    color: "white",
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  editButton: {
    backgroundColor: "#007BFF",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 15,
  },
  editButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 10,
  },
  changePfpButton: {
    backgroundColor: "#007BFF",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  changePfpButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
});
