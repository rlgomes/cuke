module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      useESM: false
    }]
  },
  extensionsToTreatAsEsm: [],
  transformIgnorePatterns: [
    'node_modules/(?!(jsdom))'
  ],
  globals: {
    'ts-jest': {
      tsconfig: {
        module: 'commonjs'
      }
    }
  }
}
