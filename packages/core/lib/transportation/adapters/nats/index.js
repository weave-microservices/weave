/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2018 Fachwerk
 */

const TransportBase = require('../transport-base')
const { defaultsDeep } = require('lodash')
const MessageTypes = require('../../message-types')

function RedisTransporter (options) {
    const self = TransportBase(options)

    options = defaultsDeep(options, {
        url: 'nats://localhost:4222'
    })
    let client
    self.state = 'ready'

    self.connect = (isTryReconnect = false) => {
        return new Promise((resolve, reject) => {
            let NATS

            try {
                NATS = require('nats')
            } catch (error) {
                self.log.error(`The package 'nats' is not installed. Please install the package with 'npm install nats'.`)
            }
            client = NATS.connect(options)

            client.on('connect', () => {
                if (self.interruptionCount > 0 && !self.connected) {
                    self.emit('adapter.connected', true)
                }
                self.connected = true
                return resolve()
            })

            client.on('error', (error) => {
                self.log.error('Nats error ' + error)
                return reject(error)
            })

            client.on('disconnect', () => {
                if (self.connected) {
                    self.connected = false
                    self.interruptionCount++
                    self.emit('adapter.disconnected', false)
                }
            })

            client.on('reconnecting', () => {
                self.log.error('Try to reconnect...')
            })

            client.on('reconnect', (nc) => {
                if (!self.connected) {
                    self.connected = true
                    self.interruptionCount
                    self.emit('adapter.connected', false)
                }
            })

            client.on('close', () => {
                console.log('close')
            })
        }).then(() => {
            self.emit('adapter.connected', false)
            makeSubscribtions()
        })
    }

    self.close = () => {
        if (client) {
            client.flush(() => {
                client.close()
                client = null
            })
        }
    }

    self.send = (message) => {
        if (!client) {
            return Promise.resolve()
        }

        return new Promise(resolve => {
            const data = self.serialize(message)
            const topic = self.getTopic(message.type, message.targetNodeId)
            client.publish(topic, data, resolve)
        })
    }

    return self

    function makeSubscribtions () {
        subscribe(MessageTypes.MESSAGE_DISCOVERY)
        subscribe(MessageTypes.MESSAGE_DISCOVERY, self.nodeId)
        subscribe(MessageTypes.MESSAGE_INFO)
        subscribe(MessageTypes.MESSAGE_INFO, self.nodeId)
        subscribe(MessageTypes.MESSAGE_REQUEST, self.nodeId)
        subscribe(MessageTypes.MESSAGE_RESPONSE, self.nodeId)
        subscribe(MessageTypes.MESSAGE_DISCONNECT)
        subscribe(MessageTypes.MESSAGE_HEARTBEAT)
        subscribe(MessageTypes.MESSAGE_EVENT, self.nodeId)
    }

    function subscribe (type, nodeId) {
        const topic = self.getTopic(type, nodeId)
        client.subscribe(topic, message => self.incommingMessage(type, message))
    }
}

module.exports = RedisTransporter
