module.exports = {
  testEnvironment: 'node',
  coverageDirectory: '../coverage',
  coveragePathIgnorePatterns: [
    '/node_modules/',
    './test/'
  ],
  rootDir: './',
  roots: [
    './test'
  ]
}
