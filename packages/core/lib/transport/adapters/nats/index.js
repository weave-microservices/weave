/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2020 Fachwerk
 */

const TransportBase = require('../adapter-base')
const { defaultsDeep } = require('@weave-js/utils')

function NATSTransportAdapter (adapterOptions) {
  let client

  if (typeof adapterOptions === 'string') {
    adapterOptions = { url: adapterOptions }
  }

  adapterOptions = defaultsDeep(adapterOptions, {
    url: 'nats://localhost:4222'
  })

  return Object.assign(TransportBase(adapterOptions), {
    name: 'NATS',
    connect () {
      return new Promise((resolve, reject) => {
        let NATS

        try {
          NATS = require('nats')
        } catch (error) {
          this.log.error('The package \'nats\' is not installed. Please install the package with \'npm install nats\'.')
          error.skipRetry = true
          return reject(error)
        }
        client = NATS.connect(adapterOptions)

        client.on('connect', () => {
          if (this.interruptionCount > 0 && !this.isConnected) {
            this.log.info('NATS client reconnected.')
          }
          this.log.info('NATS client connected.')
          this.isCOnnected = true
          this.connected()

          return resolve()
        })

        client.on('error', (error) => {
          this.log.error('NATS error ' + error.message)
          if (!this.isConnected) {
            reject(error)
          }
        })

        client.on('disconnect', () => {
          if (this.isConnected) {
            this.connected = false
            this.interruptionCount++
            this.log.warn('NATS client disconnected.')
            this.disconnected()
          }
        })

        client.on('reconnecting', () => {
          this.log.warn('NATS client is reconnecting...')
        })

        client.on('reconnect', () => {
          if (!this.connected) {
            this.connected = true
            this.interruptionCount
            this.log.info('NATS client reconnected.')
            // self.emit('adapter.connected', false)
            this.connected()
          }
        })

        client.on('close', () => {
          this.isConnected = false
        })
      })
    },
    subscribe (type, nodeId) {
      return new Promise(resolve => {
        const topic = this.getTopic(type, nodeId)
        client.subscribe(topic, message => this.incommingMessage(type, message))
        resolve()
      })
    },
    send (message) {
      if (!client) {
        return Promise.resolve()
      }

      return new Promise(resolve => {
        const data = this.serialize(message)
        this.updateStatisticSent(data.length)
        const topic = this.getTopic(message.type, message.targetNodeId)
        client.publish(topic, data, resolve)
      })
    },
    close () {
      if (client) {
        client.flush(() => {
          client.close()
          client = null
        })
      }
    }
  })
}

module.exports = NATSTransportAdapter

