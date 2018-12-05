/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2018 Fachwerk
 */

const TransportBase = require('../transport-base')
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

    self.onInit = deps => {
        self.messageTypeHelper = TCPMessageTypeHelper(self.MessageTypes)
    }

    self.connect = (isTryReconnect = false) => {
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
            })
    }

    self.close = () => {
        return Promise.resolve()
    }

    self.send = (message) => {
        const data = self.serialize(message)
        tcpWriter.send(message.targetNodeId, message.type, data)
        if (self.connected) {
            // clientPub.publish(self.getTopic(message.type, message.targetNodeId), data)
        }
        return Promise.resolve()
    }

    self.onIncomingMessage = (type, message, socket) => {
        switch (type) {
            case MessageTypes.MESSAGE_GOSSIP_HELLO: return onGossipHelloMessage(message, socket)
            case MessageTypes.MESSAGE_GOSSIP_REQUEST: return onGossipRequestMessage(message, socket)
            case MessageTypes.MESSAGE_GOSSIP_RESPONSE: return onGossipResponseMessage(message, socket)
            default: return onMessage(message, socket)
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
                    if (endpoint.nodeId === self.nodeId) {
                        // get own point from url list
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
        const node = self.registry.nodes.createNode(nodeId)

        node.isLocal = false
        node.isAvailable = false
        node.IPList = [host]
        node.hostname = host
        node.port = port

        self.registry.nodes.add(nodeId, node)
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
        const list = self.registry.nodes.toArray()
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
                if (!node.isLocal) {
                    onlineNodes.push(node)
                }
                payload.online[node.id] = [node.cpu || 0]
            } else {
                offlineNodes.push(node)
                payload.offline[node.id] = [node.cpu || 0]
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
            const message = self.Message(self.MessageTypes.MESSAGE_GOSSIP_REQUEST, destinationNode.id, payload)
            self.send(message)
        }
    }

    function onGossipHelloMessage (payload, socket) {
        try {
            const message = self.deserialize(payload)
            const nodeId = message.pa
        } catch (error) {

        }  
    }

    function onGossipRequestMessage (data, socket) {
        try {
            const message = self.deserialize(data)
            const payload = message.payload
            const list = self.registry.nodes.toArray()

            list.map(node => {
                const online = payload.online ? payload.online[node.id] : null
                const offline = payload.offline ? payload.offline[node.id] : null

                let seq, cpuSeq, cpu

                if (offline) {
                    // sender said node is offline
                    if (!node.isAvailable) {
                        // we know node is offline
                    }
                } else if (online) {

                }

            })
        } catch (error) {
            self.log.error(error)
        }  
    }

    function onGossipResponseMessage (message, socket) {
        
    }

    function onMessage (message, socket) {
        
    }
}

module.exports = TCPTransporter
