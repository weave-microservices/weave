module.exports = {
  testEnvironment: 'node',
  preset: '@shelf/jest-mongodb',
  coveragePathIgnorePatterns: [
    '/node_modules/',
    './test/'
  ],
  rootDir: './',
  roots: [
    './test'
  ],
  testTimeout: 20000
};
