const createBroker = require('./broker')

exports.initBroker = (options) => {
  return {
    createBrokerInstance: createBroker(options)
  }
}
