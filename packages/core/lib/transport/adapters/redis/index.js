/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2018 Fachwerk
 */

const TransportBase = require('../transport-base')
const Redis = require('ioredis')
const { defaultsDeep } = require('lodash')

function RedisTransportAdapter (adapterOptions) {
    const self = TransportBase(adapterOptions)
    let clientSub
    let clientPub

    adapterOptions = defaultsDeep(adapterOptions, {
        port: 6379,
        host: '127.0.0.1'
    })

    self.name = 'REDIS'

    self.connect = (isTryReconnect = false, errorHandler) => {
        return new Promise((resolve, reject) => {
            clientSub = new Redis(adapterOptions)

            clientSub.on('connect', () => {
                clientPub = new Redis(adapterOptions)
                self.log.info(`Redis SUB client connected.`)
                clientPub.on('connect', () => {
                    if (self.interruptionCount > 0 && !self.connected) {
                        self.emit('adapter.connected', true)
                    }
                    self.log.info(`Redis PUB client connected.`)
                    self.connected = true
                    resolve()
                })

                clientPub.on('error', error => {
                    self.log.error(`Redis PUB error:`, error.message)
                    reject(error)
                })

                clientPub.on('close', () => {
                    if (self.connected) {
                        self.connected = false
                        self.interruptionCount++
                        self.log.warn(`Redis PUB disconnected.`)
                        self.emit('adapter.disconnected', false)
                    }
                })
            })

            clientSub.on('error', error => {
                self.log.error(`Redis PUB error:`, error.message)
                reject(error)
            })

            clientSub.on('message', (topic, message) => {
                const type = topic.split('.')[1]
                self.incommingMessage(type, message)
            })

            clientSub.on('close', () => {
                self.connected = false
                self.log.warn(`Redis SUB disconnected.`)
            })
        })
            .then(() => {
                self.emit('adapter.connected', false)
            })
    }

    self.close = () => {
        if (clientPub && clientSub) {
            clientPub.disconnect()
            clientSub.disconnect()
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
}

module.exports = RedisTransportAdapter
