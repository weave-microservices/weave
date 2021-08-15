exports.name = 'test-service'

exports.started = function () {
  this.timer = setInterval(() => {
    this.log.info('hello!')
  }, 2000)
}
