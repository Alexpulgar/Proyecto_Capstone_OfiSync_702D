// jest.config.cjs
module.exports = {
  testEnvironment: 'jest-environment-jsdom',
  // La ruta ahora es más simple
  setupFilesAfterEnv: ['<rootDir>/setupTests.js'], // <-- LÍNEA CORREGIDA
  moduleNameMapper: {
    '\\.css$': '<rootDir>/__mocks__/styleMock.cjs',
  }
};