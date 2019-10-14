module.exports = {
    testEnvironment: 'node',
    coverageDirectory: '../coverage',
    coveragePathIgnorePatterns: [
        '/node_modules/'
    ],
    rootDir: './lib',
    roots: [
        '../test'
    ],
    verbose: false
}
