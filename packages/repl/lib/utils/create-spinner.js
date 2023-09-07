const ora = require('ora');

module.exports = function createSpinner (text, type = 'dots4') {
  return ora({
    text,
    spinner: type
  });
};
