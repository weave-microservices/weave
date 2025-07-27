const { testFunc } = require('../testlib');
const { makeSomething } = require('../external/external-test');
exports.name = 'test-private';

exports.settings = {
  $private: true
};

exports.started = function () {
  this.timer = setInterval(() => {
  }, 2000);
};

exports.actions = {
  hello () {
    return makeSomething();
  }
};

exports.started = async function () {
  testFunc();
  console.log('test');
};
