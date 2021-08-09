const { Weave } = require('../../lib/index')

exports.createNode = (options, services = []) => {
  const broker = Weave(options, services)
  if (services) {
    services.map(schema => broker.createService(Object.assign({}, schema)))
  }
  return broker
}
