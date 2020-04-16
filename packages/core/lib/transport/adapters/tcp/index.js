
const { defaultsDeep } = require('lodash')
const TransportBase = require('../adapter-base')
const Swim = require('./discovery/index')

const defaultOptions = {
  port: 56733,
  discovery: {
    enabled: true,
    type: 'udp4',
    multicastAddress: '239.0.0.0',
    port: 54355
  }
}

module.exports = function SwimTransport (adapterOptions) {
  adapterOptions = defaultsDeep(adapterOptions, defaultOptions)

  const self = TransportBase(adapterOptions)
  self.afterInit = function () {
    self.nodes = this.broker.registry.nodes
    self.registry = self.broker.registry
  }

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

  function addDiscoveredNode(nodeId, host, port) {
    const node = self.broker.registry.nodes.createNode(nodeId)

    self.broker.registry.nodes.add(node.id, node)

    return newNode
  }

  function startDiscoveryServer () {
    self.swim.bus.on('message', ({ nodeId, host, port }) => {
      if (nodeId) { //  && nodeId !== self.broker.nodeId
        let node = self.broker.registry.nodes.get(nodeId)
        if (!node) {
          self.log.debug(`Discoverd a new node`)

          node = addDiscoveredNode(nodeId)
        } else if (!node.isAvailable) {
          self.log.debug(`Discoverd a new node`)

        }
      }
    })

    self.swim.init()
  }

  return self
}
