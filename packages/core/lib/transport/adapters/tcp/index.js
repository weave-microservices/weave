/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2020 Fachwerk
 */

const TransportBase = require('../adapter-base')
const { defaultsDeep } = require('lodash')
const MessageTypes = require('../../message-types')
const TCPReader = require('./lib/tcpReader')
const TCPWriter = require('./lib/tcpWriter')
const TCPMessageTypeHelper = require('./lib/tcp-messagetypes')

function TCPTransporter (options) {
  const self = TransportBase(options)
  let tcpReader
  let tcpWriter
  let gossipTimer

  options = defaultsDeep(options, {
    udpDiscovery: false,
    port: null,
    urls: null
  })

  self.state = 'ready'

  self.messageTypeHelper = TCPMessageTypeHelper(MessageTypes)

  self.connect = (/* isTryReconnect = false */) => {
    return Promise.resolve()
      .then(() => {
        if (options.urls) {
          return loadUrls(options.urls)
        }
      })
      .then(() => startTCPServer())
      .then(() => startUDPServer())
      .then(() => startTimers())
      .then(() => {
        self.log.info('TCP transport started.')
        self.broker.registry.nodes.localNode.port = options.port
        self.broker.registry.generateLocalNodeInfo()
      })
      .then(() => {
        self.connected(false, false)
      })
  }

  self.subscribe = (/* type, nodeId */) => {
    return Promise.resolve()
  }

  self.close = () => {
    clearInterval(gossipTimer)
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
    tcpWriter.send(message.targetNodeId, message.type, data)
    if (self.connected) {
      // clientPub.publish(self.getTopic(message.type, message.targetNodeId), data)
    }
    return Promise.resolve()
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

  self.onIncomingMessage = (type, data, socket) => {
    switch (type) {
    case MessageTypes.MESSAGE_GOSSIP_HELLO: return onGossipHelloMessage(data, socket)
    case MessageTypes.MESSAGE_GOSSIP_REQUEST: return onGossipRequestMessage(data, socket)
    case MessageTypes.MESSAGE_GOSSIP_RESPONSE: return onGossipResponseMessage(data, socket)
    default: return onMessage(type, data, socket)
    }
  }

  return Object.assign(self, {})

  function loadUrls (urls) {
    if (!Array.isArray(urls)) {
      return Promise.resolve()
    }

    if (Array.isArray(urls) && urls.length === 0) {
      return Promise.resolve()
    }

    return Promise.resolve(urls)
      .then(urls => {
        urls.map(connString => {
          if (!connString) {
            return
          }

          if (connString.startsWith('tcp://')) {
            connString = connString.replace('tcp://', '')
          }

          const parts = connString.split('/')
          if (parts.length < 2) {
            return self.log.warn('Invalid Endpoint URL. NodeId is missing.', connString)
          }

          const url = parts[0].split(':')
          if (url.length < 2) {
            return self.log.warn('Invalid Endpoint URL. Port is missing.', connString)
          }

          const nodeId = parts[1]
          const port = Number(url.pop())
          const host = url.join(':')

          return { nodeId, host, port }
        }).forEach(endpoint => {
          if (!endpoint) {
            return
          }
          // Get own port from url list
          if (endpoint.nodeId === self.broker.nodeId) {
            if (endpoint.port) {
              options.port = endpoint.port
            }
          } else {
            addNodeToOfflineList(endpoint)
          }
        })
      })
  }

  function addNodeToOfflineList ({ nodeId, host, port }) {
    const node = self.broker.registry.nodes.createNode(nodeId)

    node.isLocal = false
    node.isAvailable = false
    node.IPList = [host]
    node.hostname = host
    node.port = port
    node.sequence = 0
    self.broker.registry.nodes.add(nodeId, node)
    return node
  }

  function startTCPServer () {
    tcpReader = TCPReader(self, options)
    tcpWriter = TCPWriter(self, options)
    return tcpReader.listen()
  }

  function startUDPServer () {

  }

  function startTimers () {
    gossipTimer = setInterval(() => sendGossipRequest(), 2000)
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
      self.send(message)
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
        } else {
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
        self.send(message)
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
      // const message = self.deserialize(data)
      // const payload = message.payload
      self.incommingMessage(type, data)
    } catch (error) {

    }
  }
}

module.exports = TCPTransporter
