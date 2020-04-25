const ora = require('ora')

module.exports = function createSpinner (text) {
  return ora({
    text,
    spinner: 'dots4'
  })
}
