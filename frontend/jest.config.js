module.exports = {
    preset: "react-native",
    transform: {
      "^.+\\.(js|jsx|ts|tsx)$": "babel-jest"
    },
    transformIgnorePatterns: [
      "node_modules/(?!(jest-)?react-native|@react-native|@react-navigation|@react-native-async-storage|@react-native-community)"
    ],
    moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
    setupFilesAfterEnv: ["@testing-library/jest-native/extend-expect"],
    testEnvironment: "jsdom",
    transformIgnorePatterns: [
        "node_modules/(?!(jest-)?react-native|@react-native|@react-navigation|expo-router|@react-native-async-storage|@react-native-community)"
      ]
  }
  