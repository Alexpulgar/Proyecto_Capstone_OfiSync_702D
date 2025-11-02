module.exports = {
  preset: 'jest-expo',

  setupFilesAfterEnv: ['./jest.setup.js'],

  moduleNameMapper: {
    '^@expo/vector-icons$': '<rootDir>/node_modules/react-native-vector-icons/MaterialIcons.js',
  },

  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)',
  ],
};