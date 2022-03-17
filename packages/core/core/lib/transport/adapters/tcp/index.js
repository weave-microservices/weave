
const { defaultsDeep } = require('@weave-js/utils')
const TransportBase = require('../adapteBase')
const Swim = require('./discovery/index')
const MessageTypes = require('../../messageTypes')
const TCPReader = require('./tcpReader')
const TCPWriter = require('./tcpWriter')
const { createMessage } = require('../../createMessage')

const defaultOptions = {
  port: null,
  discovery: {
    enabled: true,
    type: 'udp4',
    udpMulticast: true,
    multicastAddress: '239.0.0.0',
    port: 54355,
    udpReuseAddress: true
  },
  gossipTimerInterval: 2000,
  maxPacketSize: 1024 * 1024 * 50
}

module.exports = function SwimTransport (adapterOptions) {
  adapterOptions = defaultsDeep(adapterOptions, defaultOptions)

  const self = TransportBase(adapterOptions)
  let tcpReader
  let tcpWriter
  let gossipTimer

  self.afterInit = async function () {
    self.nodes = this.broker.registry.nodeCollection
    self.registry = self.broker.registry
    self.swim = Swim(self, adapterOptions)
  }

  self.connect = async () => {
    const port = await startTCPServer()

    await startDiscoveryServer(port)
    await startTimers()

    self.log.info('TCP transport adapter started.')

    self.broker.registry.nodeCollection.localNode.port = port
    self.broker.registry.generateLocalNodeInfo()

    self.connected({ wasReconnect: false, useHeartbeatTimer: false, useRemoteNodeCheckTimer: false, useOfflineCheckTimer: true })

    return Promise.resolve()
  }

  self.send = (message) => {
    if (!message.targetNodeId || ![
      MessageTypes.MESSAGE_PING,
      MessageTypes.MESSAGE_PONG,
      MessageTypes.MESSAGE_EVENT,
      MessageTypes.MESSAGE_REQUEST,
      MessageTypes.MESSAGE_RESPONSE,
      MessageTypes.MESSAGE_GOSSIP_HELLO,
      MessageTypes.MESSAGE_GOSSIP_REQUEST,
      MessageTypes.MESSAGE_GOSSIP_RESPONSE,
      MessageTypes.MESSAGE_RESPONSE_STREAM_BACKPRESSURE,
      MessageTypes.MESSAGE_RESPONSE_STREAM_RESUME,
      MessageTypes.MESSAGE_REQUEST_STREAM_BACKPRESSURE,
      MessageTypes.MESSAGE_REQUEST_STREAM_RESUME
    ].includes(message.type)) {
      if (message.type === MessageTypes.MESSAGE_DISCONNECT) {
        // send a disconnect message to all connected nodes
        return publishNodeDisconnect(message)
      }
      return Promise.resolve()
    }

    const data = self.serialize(message)
    return tcpWriter.send(message.targetNodeId, message.type, data)
  }

  self.sendHello = nodeId => {
    const node = self.broker.registry.nodeCollection.get(nodeId)

    if (!node) {
      return Promise.reject(new Error('Node not found.'))
    }

    const localNode = self.broker.registry.nodeCollection.localNode

    const message = createMessage(MessageTypes.MESSAGE_GOSSIP_HELLO, nodeId, {
      host: localNode.IPList[0],
      port: localNode.port
    })

    self.send(message)

    return Promise.resolve()
  }

  self.close = () => {
    clearInterval(gossipTimer)
    if (tcpReader) {
      tcpReader.close()
    }
    if (tcpWriter) {
      tcpWriter.close()
    }
    if (tcpReader) {
      tcpReader.close()
    }

    self.swim.close()

    return Promise.resolve()
  }

  // Send a disconnect message to all connected nodes.
  function publishNodeDisconnect (message) {
    const nodes = self.broker.registry.nodeCollection.toArray()
    return Promise.all(
      nodes
        .filter(node => node.isAvailable && !node.isLocal)
        .map(node => {
          const data = self.serialize(message)
          return tcpWriter.send(node.id, message.type, data)
        })
    )
  }

  function addDiscoveredNode (nodeId, host, port) {
    const node = self.broker.registry.nodeCollection.createNode(nodeId)

    node.isLocal = false
    node.isAvailable = false
    node.IPList = [host]
    node.hostname = host
    node.port = port
    node.sequence = 0
    node.offlineTime = Date.now()
    self.broker.registry.nodeCollection.add(node.id, node)

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
      return self.incomingMessage(type, data)
    }
  }

  function startDiscoveryServer (port) {
    self.swim.bus.on('message', ({ nodeId, host, port }) => {
      if (nodeId && nodeId !== self.broker.nodeId) {
        let node = self.broker.registry.nodeCollection.get(nodeId)
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

    self.swim.start(port)
  }

  function startTCPServer () {
    tcpReader = TCPReader(self, adapterOptions)
    tcpWriter = TCPWriter(self, adapterOptions)

    tcpReader.on('message', onMessage)

    tcpWriter.on('error', (error, nodeId) => {
      self.log.debug('TCP client error on ', error)
      self.broker.registry.nodeDisconnected(nodeId, false)
    })

    tcpWriter.on('end', nodeId => {
      self.log.debug('TCP connection ended with')
      self.broker.registry.nodeDisconnected(nodeId, false)
    })

    // tcpWriter.on('error', (_, nodeId) => {
    //   self.log.debug('TCP server error on ')
    //   // this.nodes.disconnected(nodeId, false)
    // })

    return tcpReader.listen()
  }

  function startTimers () {
    gossipTimer = setInterval(() => sendGossipRequest(), adapterOptions.gossipTimerInterval)
    gossipTimer.unref()
  }

  function sendGossipRequest () {
    const list = self.broker.registry.nodeCollection.toArray()
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
        if (node.sequence > 0) {
          payload.offline[node.id] = node.sequence
        }
        offlineNodes.push(node)
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
      const message = createMessage(MessageTypes.MESSAGE_GOSSIP_REQUEST, destinationNode.id, payload)

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
      const node = self.broker.registry.nodeCollection.get(nodeId)

      if (!node) {
        addDiscoveredNode(nodeId, payload.host, payload.port)
      }
    } catch (error) {
      self.log.error('Invalid gossip hello message.', error.message)
    }
  }

  // Handle incoming gossip request
  function onGossipRequestMessage (data) {
    try {
      const message = self.deserialize(data)
      const payload = message.payload
      const list = self.broker.registry.nodeCollection.toArray()

      // Init gossip response
      const response = {
        online: {},
        offline: {}
      }

      list.forEach(node => {
        const online = payload.online ? payload.online[node.id] : null
        const offline = payload.offline ? payload.offline[node.id] : null

        // eslint-disable-next-line no-unused-vars
        let sequence, cpuSequence, cpu

        if (offline) {
          sequence = offline
        } else if (online) {
          [sequence, cpuSequence, cpu] = online
        }

        // Local node information are newer
        if (!sequence || sequence < node.sequence) {
          // our node info is newer than the
          if (node.isAvailable) {
            const nodeInfo = self.broker.registry.getNodeInfo(node.id)
            response.online[node.id] = [nodeInfo, node.cpuSequence || 0, node.cpu || 0]
          } else {
            response.offline[node.id] = node.sequence
          }
          return
        }

        // sender said node is offline
        if (offline) {
          // our node knows, the node is offline
          if (!node.isAvailable) {
            // we know node is offline
            if (sequence > node.sequence) {
              node.sequence = sequence
            }
            return
          } else if (!node.isLocal) {
            // we know, the node is offline
            self.broker.registry.nodeCollection.disconnected(node.id, false)
            node.sequence = sequence
          } else if (node.isLocal) {
            // Remote node said we are offline, but we are online and send back our node information.
            node.sequence = sequence + 1
            const nodeInfo = self.broker.registry.getLocalNodeInfo(true)
            response.online[node.id] = [nodeInfo, node.cpuSequence || 0, node.cpu || 0]
          }
        } else if (online) {
          // Remote node said we are online
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
        const destinationNode = self.broker.registry.nodeCollection.get(payload.sender)
        const message = createMessage(MessageTypes.MESSAGE_GOSSIP_RESPONSE, destinationNode.id, response)
        self.send(message).catch(() => {})
      }
    } catch (error) {
      self.log.error(error)
    }
  }

  // Handle incoming gossip response
  function onGossipResponseMessage (data, socket) {
    try {
      const message = self.deserialize(data)
      const payload = message.payload

      // Process online nodes
      if (payload.online) {
        Object.keys(payload.online).forEach(nodeId => {
          if (nodeId === self.broker.nodeId) {
            return
          }

          const item = payload.online[nodeId]

          if (!Array.isArray(item)) {
            return
          }

          let info
          let cpuSequence
          let cpu

          if (item.length === 1) {
            [info] = item
          } else if (item.length === 2) {
            [cpuSequence, cpu] = item
          } else if (item.length === 3) {
            [info, cpuSequence, cpu] = item
          }

          const node = self.broker.registry.nodeCollection.get(nodeId)

          if (info && (!node || node.sequence < info.sequence)) {
            // if node is a new node or has a higher sequence update local info.
            info.sender = nodeId
            self.broker.registry.processNodeInfo(info)
          }

          if (node && node.isAvailable && cpuSequence && cpuSequence > node.cpuSequence) {
            node.heartbeat({
              cpu,
              cpuSequence
            })
          }
        })
      }

      // Offline nodes
      if (payload.offline) {
        Object.keys(payload.offline).forEach(nodeId => {
          if (nodeId === self.broker.nodeId) return

          const sequence = payload.offline[nodeId]
          const node = self.broker.registry.nodeCollection.get(nodeId)

          if (!node) {
            return
          }

          // the remote node is newer
          if (sequence > node.sequence) {
            if (node.isAvailable) {
              self.broker.registry.nodeCollection.disconnected(node.id, false)
            }
            node.sequence = sequence
          }
        })
      }
    } catch (error) {
      self.log.error(error)
    }
  }

  function onMessage (type, data, socket) {
    try {
      self.onIncomingMessage(type, data, socket)
    } catch (error) {
      console.log(error)
    }
  }

  return self
}
