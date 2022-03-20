exports.name = 'test-service';

exports.started = function () {
  this.timer = setInterval(() => {
  }, 2000);
};

exports.actions = {
  hello (context) {
    return context.data;
  }
};
