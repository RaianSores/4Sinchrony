module.exports = {
  preset: '@react-native/jest-preset',
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-native(-community)?|@react-navigation|react-native-gesture-handler|react-native-reanimated|react-native-safe-area-context|react-native-screens|react-native-tab-view|react-native-vector-icons|react-native-mmkv|react-native-keychain|@react-native-clipboard|@react-native-google-signin|@tanstack|react-native-nitro-modules|react-native-dotenv|zustand|@react-native-async-storage|@sentry)/)',
  ],
  moduleNameMapper: {
    '^react-native-vector-icons/(.*)$': '<rootDir>/__mocks__/react-native-vector-icons.ts',
  },
  testPathIgnorePatterns: ['/node_modules/', '__tests__/App\\.test\\.tsx$'],
  setupFiles: ['./jest.setup.ts'],
};
