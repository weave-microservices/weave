module.exports = {
  root: true,
  extends: [
    'eslint-config-fw'
  ],
  rules: {
    'quotes': [2, 'single', { 'avoidEscape': true }],
    'indent': ['error', 2]
  }
}
