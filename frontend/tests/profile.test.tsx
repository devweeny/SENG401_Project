import React from 'react'
import { render, fireEvent, waitFor } from '@testing-library/react-native'
import ProfileScreen from '../app/(tabs)/profile'

// UT07 – Update Profile Info
it('renders and updates profile fields', async () => {
  const { getByText, getByPlaceholderText } = render(<ProfileScreen />)

  fireEvent.press(getByText('Update Profile'))
  fireEvent.changeText(getByPlaceholderText('Enter new name'), 'New Name')
  fireEvent.changeText(getByPlaceholderText('Enter new email'), 'new@example.com')

  expect(getByPlaceholderText('Enter new name').props.value).toBe('New Name')
})

// UT08 – Set Dietary Preferences
it('toggles dietary preferences', async () => {
  const { getByText } = render(<ProfileScreen />)
  fireEvent.press(getByText(/vegetarian/i))
})

// UT09 – Upload Profile Picture (Not implemented in UI yet, placeholder test)
it('displays default avatar icon', () => {
  const { getByTestId } = render(<ProfileScreen />)
  // You may add a testID to the Ionicons component
})
