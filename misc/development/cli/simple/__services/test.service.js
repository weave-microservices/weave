const { testFunc } = require('../testlib');

exports.name = 'test-service';

exports.started = function () {
  this.timer = setInterval(() => {
    testFunc();
  }, 2000);
};

exports.actions = {
  hello (context) {
    console.log(context.data);
    // Test that requestId appears in service logs
    this.log.info('Testing requestId in logs', { data: context.data });
    return context.data;
  }
};

