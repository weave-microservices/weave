/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2018 Fachwerk
 */

const TransportBase = require('../adapter-base')
const Redis = require('ioredis')
const { defaultsDeep } = require('lodash')

function RedisTransportAdapter (adapterOptions) {
    let clientSub
    let clientPub

    adapterOptions = defaultsDeep(adapterOptions, {
        port: 6379,
        host: '127.0.0.1'
    })

    return Object.assign(TransportBase(adapterOptions), {
        name: 'REDIS',
        connect (isTryReconnect = false, errorHandler) {
            return new Promise((resolve, reject) => {
                clientSub = new Redis(adapterOptions)

                clientSub.on('connect', () => {
                    clientPub = new Redis(adapterOptions)
                    this.log.info(`Redis SUB client connected.`)
                    clientPub.on('connect', () => {
                        if (this.interruptionCount > 0 && !this.isConnected) {
                            this.bus.emit('adapter.connected', true)
                        }
                        this.log.info(`Redis PUB client connected.`)
                        this.isConnected = true
                        resolve()
                    })

                    clientPub.on('error', error => {
                        this.log.error(`Redis PUB error:`, error.message)
                        reject(error)
                    })

                    clientPub.on('close', () => {
                        if (this.isConnected) {
                            this.isConnected = false
                            this.interruptionCount++
                            this.log.warn(`Redis PUB disconnected.`)
                            this.bus.emit('adapter.disconnected', false)
                        }
                    })
                })

                clientSub.on('error', error => {
                    this.log.error(`Redis PUB error:`, error.message)
                    reject(error)
                })

                clientSub.on('message', (topic, message) => {
                    const type = topic.split('.')[1]
                    this.incommingMessage(type, message)
                })

                clientSub.on('close', () => {
                    this.isConnected = false
                    this.log.warn(`Redis SUB disconnected.`)
                })
            })
                .then(() => {
                    this.connected()
                })
        },
        subscribe (type, nodeId) {
            return new Promise(resolve => {
                clientSub.subscribe(this.getTopic(type, nodeId), () => {
                    return resolve()
                })
            })
        },
        send (message) {
            const data = this.serialize(message)
            if (this.isConnected) {
                clientPub.publish(this.getTopic(message.type, message.targetNodeId), data)
            }
            return Promise.resolve()
        },
        close () {
            if (clientPub && clientSub) {
                clientPub.disconnect()
                clientSub.disconnect()
            }
            return Promise.resolve()
        }
    })
}

module.exports = RedisTransportAdapter
