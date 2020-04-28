
const { defaultsDeep } = require('lodash')
const TransportBase = require('../adapter-base')
const Swim = require('./discovery/index')
const MessageTypes = require('../../message-types')
const TCPReader = require('./tcpReader')
const TCPWriter = require('./tcpWriter')
const TCPMessageTypeHelper = require('./tcp-messagetypes')

const defaultOptions = {
  port: null,
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
  let tcpReader
  let tcpWriter
  let gossipTimer

  self.afterInit = function () {
    self.nodes = this.broker.registry.nodes
    self.registry = self.broker.registry
  }

  self.swim = Swim(self, adapterOptions)

  self.connect = async () => {
    const port = await startTCPServer()
    await startDiscoveryServer(port)
    await startTimers()

    self.bus.emit('$adapter.connected', false, false, false)

    self.log.info('TCP transport adapter started.')
    return Promise.resolve()
  }

  self.send = (message) => {
    if (!message.targetNodeId || ![
      MessageTypes.MESSAGE_REQUEST,
      MessageTypes.MESSAGE_RESPONSE,
      MessageTypes.MESSAGE_EVENT,
      MessageTypes.MESSAGE_GOSSIP_HELLO,
      MessageTypes.MESSAGE_GOSSIP_REQUEST,
      MessageTypes.MESSAGE_GOSSIP_RESPONSE
    ].includes(message.type)) {
      return Promise.resolve()
    }

    const data = self.serialize(message)
    return tcpWriter.send(message.targetNodeId, message.type, data)
  }

  self.sendHello = nodeId => {
    const node = self.broker.registry.nodes.get(nodeId)

    if (!node) {
      return Promise.reject(new Error('Node not found.'))
    }

    const localNode = self.broker.registry.nodes.localNode

    const message = self.transport.createMessage(MessageTypes.MESSAGE_GOSSIP_HELLO, nodeId, {
      host: localNode.IPList[0],
      port: localNode.port
    })

    self.send(message)
    return Promise.resolve()
  }

  self.close = () => {
    clearInterval(gossipTimer)
    return Promise.resolve()
  }

  function addDiscoveredNode (nodeId, host, port) {
    const node = self.broker.registry.nodes.createNode(nodeId)
    node.isLocal = false
    node.isAvailable = false
    node.IPList = [host]
    node.hostname = host
    node.port = port
    node.sequence = 0

    self.broker.registry.nodes.add(node.id, node)

    return node
  }

  self.onIncomingMessage = (type, data, socket) => {
    switch (type) {
    case MessageTypes.MESSAGE_GOSSIP_HELLO:
      return onGossipHelloMessage(data, socket)
    case MessageTypes.MESSAGE_GOSSIP_REQUEST:
      return onGossipRequestMessage(data, socket)
    case MessageTypes.MESSAGE_GOSSIP_RESPONSE:
      return onGossipResponseMessage(data, socket)
    default:
      return self.incommingMessage(type, data)
    }
  }

  function startDiscoveryServer (port) {
    self.swim.bus.on('message', ({ nodeId, host, port }) => {
      if (nodeId && nodeId !== self.broker.nodeId) {
        let node = self.broker.registry.nodes.get(nodeId)
        if (!node) {
          self.log.debug(`Discoverd a new node ${nodeId}`)

          node = addDiscoveredNode(nodeId, host, port)
        } else if (!node.isAvailable) {
          // update tcp port
          node.port = port
          self.log.debug(`Node is still not available: ${node.id}`)
        }
      }
    })

    self.swim.init(port)
  }

  function startTCPServer () {
    tcpReader = TCPReader(self, adapterOptions)
    tcpWriter = TCPWriter(self, adapterOptions)

    tcpReader.on('message', onMessage)

    tcpWriter.on('error', (error, nodeID) => {
      self.log.debug('TCP client error on ', error)
      // this.nodes.disconnected(nodeID, false)
      self.broker.registry.nodeDisconnected(nodeID, true)
    })

    tcpWriter.on('end', nodeID => {
      self.log.debug('TCP connection ended with')
      self.broker.registry.nodeDisconnected(nodeID, false)
    })

    // tcpWriter.on('error', (_, nodeID) => {
    //   self.log.debug('TCP server error on ')
    //   // this.nodes.disconnected(nodeID, false)
    // })

    return tcpReader.listen()
  }

  function startTimers () {
    gossipTimer = setInterval(() => sendGossipRequest(), 2000)
    gossipTimer.unref()
  }

  function sendGossipRequest () {
    const list = self.broker.registry.nodes.toArray()
    if (!list || list.length === 0) {
      return
    }

    const payload = {
      online: {},
      offline: {}
    }

    const onlineNodes = []
    const offlineNodes = []

    list.forEach(node => {
      if (node.isAvailable) {
        payload.online[node.id] = [node.sequence, node.cpuSequence || 0, node.cpu || 0]

        if (!node.isLocal) {
          onlineNodes.push(node)
        }
      } else {
        offlineNodes.push(node)
        payload.offline[node.id] = [node.sequence, node.cpuSequence || 0, node.cpu || 0]
      }
    })

    if (Object.keys(payload.online).length === 0) {
      delete payload.online
    }

    if (Object.keys(payload.offline).length === 0) {
      delete payload.offline
    }

    if (onlineNodes.length > 0) {
      sendGossipRequestToRandomEndpoint(payload, onlineNodes)
    }

    if (offlineNodes.length > 0) {
      sendGossipRequestToRandomEndpoint(payload, offlineNodes)
    }
  }

  function sendGossipRequestToRandomEndpoint (payload, nodes) {
    if (!nodes || nodes.length === 0) {
      return
    }

    const destinationNode = nodes[Math.floor(Math.random() * nodes.length)]
    if (destinationNode) {
      const message = self.transport.createMessage(MessageTypes.MESSAGE_GOSSIP_REQUEST, destinationNode.id, payload)

      self.send(message).catch(() => {
        self.log.debug(`Unable to send gossip response to ${destinationNode.id}`)
      })
    }
  }

  function onGossipHelloMessage (packet, socket) {
    try {
      const message = self.deserialize(packet)
      const payload = message.payload
      const nodeId = payload.sender

      const node = self.broker.registry.nodes.get(nodeId)

      if (!node) {
        self.addNodeToOfflineList({ nodeId, host: payload.host, port: payload.port })
      }
    } catch (error) {
      self.log.error('Invalid gossip hello message.', error.message)
    }
  }

  function onGossipRequestMessage (data, socket) {
    try {
      const message = self.deserialize(data)
      const payload = message.payload
      const list = self.broker.registry.nodes.toArray()

      const response = {
        online: {},
        offline: {}
      }

      list.map(node => {
        const online = payload.online ? payload.online[node.id] : null
        const offline = payload.offline ? payload.offline[node.id] : null

        // eslint-disable-next-line no-unused-vars
        let sequence, cpuSequence, cpu

        if (offline) {
          sequence = offline
        } else if (online) {
          [sequence, cpuSequence, cpu] = online
        }

        // self.log.debug(sequence, cpuSequence)
        if (offline) {
          // sender said node is offline
          if (!node.isAvailable) {
            // we know node is offline
          } else if (!node.isLocal) {
            // I am this node myself
            if (node.id === self.nodeId) {

            }
          } else if (node.isLocal) {
            node.sequence++
            const nodeInfo = self.broker.registry.getLocalNodeInfo(true)
            response.online[node.id] = [nodeInfo, node.cpuSequence || 0, node.cpu || 0]
          }
        } else if (online) {
          if (node.isAvailable) {
            if (cpuSequence > node.cpuSequence) {
              node.heartbeat({
                cpu,
                cpuSequence
              })
            } else if (cpuSequence < node.cpuSequence) {
              response.online[node.id] = [node.cpuSequence || 0, node.cpu || 0]
            }
          } else {
            return
          }
        }
      })

      if (Object.keys(response.online).length === 0) {
        delete response.online
      }

      if (Object.keys(response.offline).length === 0) {
        delete response.offline
      }

      if (response.online || response.offline) {
        const destinationNode = self.broker.registry.nodes.get(payload.sender)
        const message = self.transport.createMessage(MessageTypes.MESSAGE_GOSSIP_RESPONSE, destinationNode.id, response)
        self.send(message).catch(() => {})
      }
    } catch (error) {
      self.log.error(error)
    }
  }

  function onGossipResponseMessage (data, socket) {
    try {
      const message = self.deserialize(data)
      const payload = message.payload
      // const list = self.registry.nodes.toArray()

      if (payload.online) {
        Object.keys(payload.online).forEach(nodeId => {
          if (nodeId === self.nodeId) return

          const item = payload.online[nodeId]

          if (!Array.isArray(item)) return

          const [info, cpuSequence, cpu] = item

          const node = self.broker.registry.nodes.get(nodeId)

          if (info && (!node || node.sequence < info.sequence)) {
            // if node is a new node or has a higher sequence update local info.
            info.sender = nodeId
            self.broker.registry.processNodeInfo(info)
          }

          if (node && cpuSequence && cpuSequence > node.cpuSequence) {
            node.heartbeat({
              cpu,
              cpuSequence
            })
          }
        })
      }

      if (payload.offline) {
        Object.keys(payload.offline).forEach(nodeId => {
          if (nodeId === self.nodeId) return
        })
      }
    } catch (error) {
      self.log.error(error)
    }
  }

  function onMessage (type, data, socket) {
    try {
      // const payload = message.payload

      self.onIncomingMessage(type, data, socket)
    } catch (error) {

    }
  }

  return self
}
