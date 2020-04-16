
const { defaultsDeep } = require('lodash')
const TransportBase = require('../adapter-base')
const Swim = require('./discovery/index')

const defaultOptions = {
  discovery: {
    enabled: true,
    type: 'udp4',
    multicastAddress: '239.0.0.0',
    port: '54355'
  }
}

module.exports = function SwimTransport (adapterOptions) {
  adapterOptions = defaultsDeep(adapterOptions, defaultOptions)

  const self = TransportBase(adapterOptions)

  self.swim = Swim(self, adapterOptions)

  self.connect = async () => {
    await startDiscoveryServer()
  }

  self.send = () => {
    return Promise.resolve()
  }

  self.close = () => {
    return Promise.resolve()
  }

  function startDiscoveryServer () {
    self.swim.bus.on('message', () => {

    })

    self.swim.init()
  }

  return self
}
