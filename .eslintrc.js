module.exports = {
  root: true,
  extends: [
    'eslint-config-fw'
  ],
  'parserOptions': {
    'ecmaVersion': 2018
  },
  rules: {
    'quotes': [2, 'single', { 'avoidEscape': true }],
    'indent': ['error', 2]
  }
}
