const { testFunc } = require('../testlib');

exports.name = 'test-service2';

exports.started = function () {
  this.timer = setInterval(() => {
  }, 2000);
};

exports.actions = {
  hello (context) {
    return context.data;
  }
};

exports.started = async function () {
  testFunc();
};
