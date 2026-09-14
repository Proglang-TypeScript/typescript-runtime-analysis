module.exports = {
  testEnvironment: 'node',
  modulePathIgnorePatterns: ['<rootDir>/work/', '<rootDir>/dist/', '<rootDir>/experiments/results/'],
  testMatch: ['<rootDir>/packages/**/*.test.ts'],
  transform: {'^.+\\.tsx?$': ['ts-jest', {tsconfig: 'tsconfig.json'}]},
};
