const corePkg = require('./packages/core/core/package.json');
const validatorPkg = require('./packages/core/validator/package.json');
const utilsPkg = require('./packages/core/utils/package.json');
const lockServicePkg = require('./packages/services/lock/package.json');

module.exports = {
  verbose: true,
  projects: [
    {
      testEnvironment: 'node',
      displayName: corePkg.name,
      testMatch: ['<rootDir>/packages/core/core/**/?(*.)+(spec|test).[jt]s?(x)']
    },
    {
      testEnvironment: 'node',
      displayName: validatorPkg.name,
      testMatch: ['<rootDir>/packages/core/validator/**/?(*.)+(spec|test).[jt]s?(x)']
    },
    {
      testEnvironment: 'node',
      displayName: utilsPkg.name,
      testMatch: ['<rootDir>/packages/core/utils/**/?(*.)+(spec|test).[jt]s?(x)']
    },
    {
      testEnvironment: 'node',
      displayName: lockServicePkg.name,
      testMatch: ['<rootDir>/packages/services/lock/**/?(*.)+(spec|test).[jt]s?(x)']
    }
  ]
};
