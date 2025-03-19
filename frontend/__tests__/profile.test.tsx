import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ProfileScreen from '../app/(tabs)/profile';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { act } from 'react-test-renderer';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn(),
}));

jest.mock('expo-router', () => ({
  router: {
    replace: jest.fn(),
  },
}));

jest.mock('@expo/vector-icons', () => ({
  Ionicons: jest.fn(() => null),
}));

describe('ProfileScreen', () => {
  beforeEach(() => {
    AsyncStorage.getItem.mockClear();
    AsyncStorage.setItem.mockClear();
    AsyncStorage.clear.mockClear();
    router.replace.mockClear();
  });

  it('renders loading state initially', () => {
    const { getByText } = render(<ProfileScreen />);
    expect(getByText('Loading profile...')).toBeTruthy();
  });

  it('loads user data from AsyncStorage', async () => {
    const mockUserData = { email: 'test@example.com', name: 'Test User' };
    AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(mockUserData));

    const { getByText } = render(<ProfileScreen />);

    await waitFor(() => expect(getByText('Test User')).toBeTruthy());
    await waitFor(() => expect(getByText('test@example.com')).toBeTruthy());
  });

  it('handles guest user mode', async () => {
    AsyncStorage.getItem.mockResolvedValueOnce(null);

    const { getByText } = render(<ProfileScreen />);

    await waitFor(() => expect(getByText('Logged in as Guest')).toBeTruthy());
  });

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

  it('saves profile changes', async () => {
    const mockUserData = { email: 'test@example.com', name: 'Test User' };
    AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(mockUserData));

    const { getByText, getByPlaceholderText } = render(<ProfileScreen />);

    await waitFor(() => expect(getByText('Update Profile')).toBeTruthy());

    fireEvent.press(getByText('Update Profile'));
    fireEvent.changeText(getByPlaceholderText('Enter new name'), 'New Name');
    fireEvent.changeText(getByPlaceholderText('Enter new email'), 'new@example.com');
    fireEvent.press(getByText('Save Changes'));

    // Debugging: Check if handleSaveProfile is called
    console.log('Save Changes button pressed');

    // Verify AsyncStorage.setItem is called with the correct arguments
    await waitFor(() =>
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('user', expect.any(String))
    );
    expect(getByText('Profile updated successfully!')).toBeTruthy();
  });

  it('logs out the user', async () => {
    const { getByText } = render(<ProfileScreen />);

    // Wait for the "Logout" button to appear
    await waitFor(() => getByText('Logout'));

    // Press the "Logout" button
    fireEvent.press(getByText('Logout'));

    // Check if AsyncStorage.clear was called
    await waitFor(() => expect(AsyncStorage.clear).toHaveBeenCalled());

    // Check if router.replace was called with '/login'
    expect(router.replace).toHaveBeenCalledWith('/login');
  });

  it('updates profile information', async () => {
    const { getByPlaceholderText, getByText } = render(<ProfileScreen />);
  
    // Ensure the initial state is not editing
    expect(getByText('Update Profile')).toBeTruthy();
  
    // Press the Update Profile button to enable edit mode
    fireEvent.press(getByText('Update Profile'));
  
    // Change the text in the input fields
    fireEvent.changeText(getByPlaceholderText('Enter new name'), 'New Name');
    fireEvent.press(getByText('Save'));
  
    // Wait for the state updates and check for the success message
    await waitFor(() => {
      expect(getByText('Profile updated successfully')).toBeTruthy();
    });
  });
});