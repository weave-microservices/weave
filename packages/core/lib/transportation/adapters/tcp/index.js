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
        tcpWriter.send(message.targetNodeId, 1, data)
        if (self.connected) {
            // clientPub.publish(self.getTopic(message.type, message.targetNodeId), data)
        }
        return Promise.resolve()
    }

    return Object.assign(self, {})

    // function makeSubscribtions () {
    //     // register transportation handler.
    //     subscribe(MessageTypes.MESSAGE_DISCOVERY)
    //     subscribe(MessageTypes.MESSAGE_DISCOVERY, self.nodeId)
    //     subscribe(MessageTypes.MESSAGE_INFO)
    //     subscribe(MessageTypes.MESSAGE_INFO, self.nodeId)
    //     subscribe(MessageTypes.MESSAGE_REQUEST, self.nodeId)
    //     subscribe(MessageTypes.MESSAGE_RESPONSE, self.nodeId)
    //     subscribe(MessageTypes.MESSAGE_DISCONNECT)
    //     subscribe(MessageTypes.MESSAGE_HEARTBEAT)
    //     subscribe(MessageTypes.MESSAGE_EVENT, self.nodeId)
    // }

    // function subscribe (type, nodeId) {
    //     clientSub.subscribe(self.getTopic(type, nodeId))
    // }

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
            const message = self.Message(self.MessageTypes.MESSAGE_GOSSIP_HELLO, destinationNode.id, payload)
            self.send(message)
        }
    }
}

module.exports = TCPTransporter
