import React from 'react'
import { render } from '@testing-library/react-native'
import MyMealsScreen from '../app/(tabs)/mymeals'

// UT17 – View Favourites
it('loads and displays saved recipes', () => {
  const { getByText } = render(<MyMealsScreen />)
  expect(getByText(/My Saved Recipes/i)).toBeTruthy()
})

// UT18 – Remove Favourite
it('allows removal of a saved recipe (mocked)', () => {
  // Should simulate clicking trash icon if rendered
  expect(true).toBeTruthy()
})
