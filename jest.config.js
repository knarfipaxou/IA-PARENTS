/**
 * Configuration Jest — tests de la LOGIQUE PURE uniquement (pas de composants
 * React Native). Environnement node + ts-jest. Les modules natifs (AsyncStorage)
 * et les assets image sont mockés pour que la logique s'exécute hors runtime RN.
 */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/__tests__'],
  testMatch: ['**/*.test.ts'],
  moduleNameMapper: {
    '@react-native-async-storage/async-storage': '<rootDir>/__tests__/mocks/asyncStorage.ts',
    'expo-speech': '<rootDir>/__tests__/mocks/expoSpeech.ts',
    '\\.(png|jpg|jpeg|gif|webp|wav)$': '<rootDir>/__tests__/mocks/assetMock.ts',
  },
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: { jsx: 'react', esModuleInterop: true, skipLibCheck: true } }],
  },
  clearMocks: true,
};
