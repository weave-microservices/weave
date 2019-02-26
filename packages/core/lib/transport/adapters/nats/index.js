/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2018 Fachwerk
 */

const TransportBase = require('../adapter-base')
const { defaultsDeep } = require('lodash')

function NATSTransportAdapter (adapterOptions) {
    const self = TransportBase(adapterOptions)
    let client

    adapterOptions = defaultsDeep(adapterOptions, {
        url: 'nats://localhost:4222'
    })

    self.name = 'NATS'

    self.connect = (isTryReconnect = false) => {
        return new Promise((resolve, reject) => {
            let NATS

            try {
                NATS = require('nats')
            } catch (error) {
                self.log.error(`The package 'nats' is not installed. Please install the package with 'npm install nats'.`)
                error.skipRetry = true
                return reject(error)
            }
            client = NATS.connect(adapterOptions)

            client.on('connect', () => {
                if (self.interruptionCount > 0 && !self.connected) {
                    self.log.info(`NATS client connected.`)
                    self.emit('adapter.connected', true)
                }
                self.connected = true
                return resolve()
            })

            client.on('error', (error) => {
                self.log.error('NATS error ' + error.message)
                if (!self.connected) {
                    reject(error)
                }
            })

            client.on('disconnect', () => {
                if (self.connected) {
                    self.connected = false
                    self.interruptionCount++
                    self.log.warn(`NATS client disconnected.`)
                    self.emit('adapter.disconnected', false)
                }
            })

            client.on('reconnecting', () => {
                self.log.warn(`NATS client is reconnecting...`)
            })

            client.on('reconnect', (nc) => {
                if (!self.connected) {
                    self.connected = true
                    self.interruptionCount
                    self.log.info(`NATS client reconnected.`)
                    self.emit('adapter.connected', false)
                }
            })

            client.on('close', () => {

            })
        }).then(() => {
            self.emit('adapter.connected', false)
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

    self.send = message => {
        if (!client) {
            return Promise.resolve()
        }

        return new Promise(resolve => {
            const data = self.serialize(message)
            const topic = self.getTopic(message.type, message.targetNodeId)
            client.publish(topic, data, resolve)
        })
    }

    self.subscribe = (type, nodeId) => {
        return new Promise(resolve => {
            const topic = self.getTopic(type, nodeId)
            client.subscribe(topic, message => self.incommingMessage(type, message))
            resolve()
        })
    }

    return self
}

module.exports = NATSTransportAdapter
