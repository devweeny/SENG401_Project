global.__DEV__ = true;
global.Promise = jest.requireActual('promise');

jest.mock('react-native-safe-area-context', () => {
  return {
    SafeAreaView: ({ children }) => children,
    SafeAreaProvider: ({ children }) => children,
    useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
  };
});

global.alert = jest.fn(); // Mock the alert function

