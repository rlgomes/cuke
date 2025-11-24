module.exports = {
  collectCoverage: true,
  coverageReporters: ['json'],
  coverageDirectory: './coverage/jest',

  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      useESM: false
    }]
  },
  transformIgnorePatterns: [
    'node_modules/(?!(jsdom))'
  ]
}
