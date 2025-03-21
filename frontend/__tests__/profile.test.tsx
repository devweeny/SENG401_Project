import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ProfileScreen from '../app/(tabs)/profile';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn(),
}));

jest.mock('expo-router', () => ({
  useRouter: () => ({
    replace: jest.fn(),
    push: jest.fn(),
  }),
}));

jest.mock('@expo/vector-icons', () => ({
  Ionicons: jest.fn(() => null),
}));

jest.mock("expo-image-picker", () => ({
  requestMediaLibraryPermissionsAsync: jest.fn(() =>
    Promise.resolve({
      granted: true,
    })
  ),
  launchImageLibraryAsync: jest.fn(() =>
    Promise.resolve({
      cancelled: false,
      assets: [{ uri: "mock-image-uri" }],
    })
  ),
}));

import * as ImagePicker from "expo-image-picker"; // Ensure ImagePicker is imported

const mockReplace = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
}));

describe('ProfileScreen', () => {
  beforeEach(() => {
    AsyncStorage.getItem.mockClear();
    AsyncStorage.setItem.mockClear();
    AsyncStorage.clear.mockClear();
    mockReplace.mockClear(); // Clear the mockReplace calls before each test
  });

  // UT17 – FR4: Renders loading state initially
  it('renders loading state initially', () => {
    const { getByText } = render(<ProfileScreen />);
    expect(getByText('Loading profile...')).toBeTruthy();
  });

  // UT18 – FR4: Loads user data from AsyncStorage
  it('loads user data from AsyncStorage', async () => {
    const mockUserData = { email: 'test@example.com', name: 'Test User' };
    AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(mockUserData));

    const { getByText } = render(<ProfileScreen />);

    await waitFor(() => expect(getByText('Test User')).toBeTruthy());
    await waitFor(() => expect(getByText('test@example.com')).toBeTruthy());
  });

  // UT19 – FR3: Handles guest user mode
  it('handles guest user mode', async () => {
    AsyncStorage.getItem.mockResolvedValueOnce(null);

    const { getByText } = render(<ProfileScreen />);

    await waitFor(() => expect(getByText('Logged in as Guest')).toBeTruthy());
  });

  // UT20 – FR4: Toggles edit mode
  it('toggles edit mode', async () => {
    const mockUserData = { email: 'test@example.com', name: 'Test User' };
    AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(mockUserData));

    const { getByText } = render(<ProfileScreen />);

    // Wait for the "Update Profile" button to appear
    await waitFor(() => expect(getByText('Update Profile')).toBeTruthy());

    fireEvent.press(getByText('Update Profile'));

    // Verify the button text changes to "Cancel"
    await waitFor(() => expect(getByText('Cancel')).toBeTruthy());
  });

  // UT21 – FR4: Saves profile changes
  it('saves profile changes', async () => {
    const mockUserData = { email: 'test@example.com', name: 'Test User', dietaryPreferences: [] };
    const updatedUserData = { email: 'new@example.com', name: 'New Name', dietaryPreferences: [] };
  
    // Mock AsyncStorage and fetch
    AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(mockUserData));
    AsyncStorage.setItem.mockResolvedValueOnce();
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(updatedUserData),
      })
    );
  
    // Mock the alert function
    global.alert = jest.fn();
  
    const { getByText, getByPlaceholderText } = render(<ProfileScreen />);
  
    // Wait for the "Update Profile" button to appear
    await waitFor(() => expect(getByText('Update Profile')).toBeTruthy());
  
    // Enter edit mode
    fireEvent.press(getByText('Update Profile'));
  
    // Update the input fields
    fireEvent.changeText(getByPlaceholderText('Enter new name'), 'New Name');
    fireEvent.changeText(getByPlaceholderText('Enter new email'), 'new@example.com');
  
    // Save the changes
    fireEvent.press(getByText('Save Changes'));
  
    // Verify AsyncStorage.setItem is called with the correct arguments
    await waitFor(() =>
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'user',
        JSON.stringify({
          email: 'new@example.com',
          name: 'New Name',
          dietaryPreferences: [],
        })
      )
    );
  
    // Verify success alert is shown
    expect(global.alert).toHaveBeenCalledWith('Profile updated successfully!');
  
    // Verify fetch was called with the correct arguments
    expect(global.fetch).toHaveBeenCalledWith('https://seng401.devweeny.ca/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${mockUserData.token}`,
      },
      body: JSON.stringify({
        name: 'New Name',
        email: 'new@example.com',
        dietaryPreferences: [],
      }),
    });
  });

  // UT22 – FR4: Logs out the user
  it('logs out the user', async () => {
    const { getByText } = render(<ProfileScreen />);

    // Wait for the "Log Out" button to appear
    await waitFor(() => getByText('Log Out'));

    // Press the "Log Out" button
    fireEvent.press(getByText('Log Out'));

    // Check if AsyncStorage.clear was called
    await waitFor(() => expect(AsyncStorage.clear).toHaveBeenCalled());

    // Check if router.replace was called with '/login'
    expect(mockReplace).toHaveBeenCalledWith('/login');
  });

  // UT23 – FR4: Displays error message when saving fails
  it('displays error message when saving fails', async () => {
    const mockUserData = { email: 'test@example.com', name: 'Test User' };
    AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(mockUserData));
  
    // Mock AsyncStorage.setItem to succeed (not relevant here since fetch will fail)
    AsyncStorage.setItem.mockResolvedValueOnce();
  
    // Mock fetch to fail
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false, // Simulate a failed response
      })
    );
  
    // Mock the alert function
    global.alert = jest.fn();
  
    const { getByText, getByPlaceholderText } = render(<ProfileScreen />);
  
    // Wait for the "Update Profile" button to appear
    await waitFor(() => expect(getByText('Update Profile')).toBeTruthy());
  
    // Enter edit mode
    fireEvent.press(getByText('Update Profile'));
  
    // Update the input fields
    fireEvent.changeText(getByPlaceholderText('Enter new name'), 'New Name');
    fireEvent.changeText(getByPlaceholderText('Enter new email'), 'new@example.com');
  
    // Save the changes
    fireEvent.press(getByText('Save Changes'));
  
    // Verify error alert is shown
    await waitFor(() =>
      expect(global.alert).toHaveBeenCalledWith('Failed to update profile. Please try again.')
    );
  });

  // UT24 – FR4: Handles error during user data loading
  it('handles error during user data loading', async () => {
    AsyncStorage.getItem.mockRejectedValueOnce(new Error('AsyncStorage error'));

    const { getByText } = render(<ProfileScreen />);

    await waitFor(() => expect(getByText('Logged in as Guest')).toBeTruthy());
  });

  // UT25 - FR4: Handles error during profile save
  it('handles error during profile save', async () => {
    const mockUserData = { email: 'test@example.com', name: 'Test User' };
    AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(mockUserData));
    AsyncStorage.setItem.mockRejectedValueOnce(new Error('AsyncStorage error'));

    const { getByText, getByPlaceholderText } = render(<ProfileScreen />);

    await waitFor(() => expect(getByText('Update Profile')).toBeTruthy());

    fireEvent.press(getByText('Update Profile'));

    fireEvent.changeText(getByPlaceholderText('Enter new name'), 'New Name');
    fireEvent.changeText(getByPlaceholderText('Enter new email'), 'new@example.com');

    fireEvent.press(getByText('Save Changes'));

    await waitFor(() =>
      expect(global.alert).toHaveBeenCalledWith('Failed to update profile. Please try again.')
    );
  });

});
