const { testFunc } = require('../testlib');

exports.name = 'test-service';

exports.started = function () {
  this.timer = setInterval(() => {
  }, 2000);
};

exports.actions = {
  hello (context) {
    return context.data;
  },
  fromEnv (_) {
    return process.env['API_KEY'];
  }
};

exports.started = async function () {
  testFunc();
};
