
const TransportBase = require('../adapter-base')
const Swim = require('./swim/')

module.exports = function SwimTransport (options) {
  const self = TransportBase(options)

  self.swim = Swim(options)

  self.connect = async () => {
    await startDiscoveryServer()
  }

  function startDiscoveryServer() {
    
  }

  return self
}
