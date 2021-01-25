const { createBroker } = require('../../lib/index')

exports.createNode = (options, services = []) => {
  const broker = createBroker(options, services)
  if (services) {
    services.map(schema => broker.createService(Object.assign({}, schema)))
  }
  return broker
}
