/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      // Suppress TS7006 implicit-any errors caused by Prisma's generated types
      // not being available in the isolated test environment.
      // Full type checking still happens at build time via `tsc`.
      diagnostics: {
        ignoreCodes: ['TS7006'],
      },
    }],
  },
};
