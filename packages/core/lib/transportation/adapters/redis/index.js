/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2018 Fachwerk
 */

const TransportBase = require('../transport-base')
const Redis = require('ioredis')
const { defaultsDeep } = require('lodash')
// const MessageTypes = require('../../message-types')

function RedisTransporter (options) {
    const self = TransportBase(options)
    let clientSub
    let clientPub

    options = defaultsDeep(options, {
        port: 6379,
        host: '127.0.0.1'
    })

    self.state = 'ready'

    self.connect = (isTryReconnect = false) => {
        return new Promise((resolve, reject) => {
            clientSub = new Redis(options)

            clientSub.on('connect', () => {
                clientPub = new Redis(options)
                clientPub.on('connect', () => {
                    if (self.interruptionCount > 0 && !self.connected) {
                        self.emit('adapter.connected', true)
                    }
                    self.connected = true
                    return resolve()
                })

                clientPub.on('error', (error) => {
                    return reject(error)
                })

                clientPub.on('close', () => {
                    if (self.connected) {
                        self.connected = false
                        self.interruptionCount++
                        self.emit('adapter.disconnected', false)
                    }
                })
            })

            clientSub.on('error', (error) => {
                self.log.error('Redis error ' + error)
                return reject(error)
            })

            clientSub.on('message', (topic, message) => {
                const type = topic.split('.')[1]
                self.incommingMessage(type, message)
            })

            clientSub.on('close', () => {
                self.connected = false
            })
        })
            .then(() => {
                setTimeout(() => {
                    self.emit('adapter.connected', false)
                }, 1)
            })
    }

    self.close = () => {
        if (clientPub && clientSub) {
            clientPub.disconnect()
            clientSub.disconnect()
            self.log.info('REDIS transport disconnected')
        }
        return Promise.resolve()
    }

    self.send = (message) => {
        const data = self.serialize(message)
        if (self.connected) {
            clientPub.publish(self.getTopic(message.type, message.targetNodeId), data)
        }
        return Promise.resolve()
    }

    self.subscribe = (type, nodeId) => {
        return new Promise(resolve => {
            clientSub.subscribe(self.getTopic(type, nodeId), () => {
                return resolve()
            })
        })
    }

    return self

    // function makeSubscribtions () {
    //     // register transportation handler.
    //     return new Promise(resolve => {
    //         subscribe(MessageTypes.MESSAGE_DISCOVERY)
    //         subscribe(MessageTypes.MESSAGE_DISCOVERY, self.nodeId)
    //         subscribe(MessageTypes.MESSAGE_INFO)
    //         subscribe(MessageTypes.MESSAGE_INFO, self.nodeId)
    //         subscribe(MessageTypes.MESSAGE_REQUEST, self.nodeId)
    //         subscribe(MessageTypes.MESSAGE_RESPONSE, self.nodeId)
    //         subscribe(MessageTypes.MESSAGE_DISCONNECT)
    //         subscribe(MessageTypes.MESSAGE_HEARTBEAT)
    //         subscribe(MessageTypes.MESSAGE_EVENT, self.nodeId)
    //         resolve()
    //     })
    // }
}

module.exports = RedisTransporter
