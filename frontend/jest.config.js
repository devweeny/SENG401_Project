module.exports = {
    preset: 'jest-expo',
    transform: {
      '^.+\\.[jt]sx?$': 'babel-jest',
    },
    setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
    transformIgnorePatterns: [
      "node_modules/(?!(jest-)?@?react-native|@react-navigation|@react-native-community|expo|expo-modules-core|@expo)"
    ],
    moduleNameMapper: {
        "^@react-native-async-storage/async-storage$": "<rootDir>/__mocks__/async-storage.js"
      },
      
    testMatch: ['**/tests/**/*.test.ts?(x)'],
  };
  