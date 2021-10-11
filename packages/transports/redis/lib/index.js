/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2021 Fachwerk
 */

const redis = require('redis')
const { defaultsDeep } = require('@weave-js/utils')
const { TransportAdapters } = require('@weave-js/core')
const utils = require('@weave-js/utils')

const defaultOptions = {
  port: 6379,
  host: '127.0.0.1'
}

const RedisTransportAdapter = adapterOptions => {
  let clientSub
  let clientPub

  // Merge options with default options.
  adapterOptions = defaultsDeep(adapterOptions, defaultOptions)

  return Object.assign(TransportAdapters.BaseAdapter(adapterOptions), {
    name: 'REDIS',
    connect () {
      return new Promise((resolve, reject) => {
        clientSub = redis.createClient(adapterOptions)

        clientSub.on('connect', () => {
          clientPub = redis.createClient(adapterOptions)

          this.log.info('Redis SUB client connected.')

          clientPub.on('connect', () => {
            if (this.interruptionCount > 0 && !this.isConnected) {
              this.bus.emit('adapter.connected', true)
            }
            this.log.info('Redis PUB client connected.')
            this.isConnected = true
            resolve()
          })

          clientPub.on('error', error => {
            this.log.error('Redis PUB error:', error.message)
            this.isConnected = false
            reject(error)
          })

          clientPub.on('close', () => {
            if (this.isConnected) {
              this.isConnected = false
              this.interruptionCount++
              this.log.warn('Redis PUB disconnected.')
              this.disconnected()
            }
          })
        })

        clientSub.on('error', error => {
          this.log.error('Redis PUB error:', error.message)
          reject(error)
        })

        clientSub.on('message', (topic, message) => {
          const type = topic.split('.')[1]
          this.incomingMessage(type, message)
        })

        clientSub.on('close', () => {
          this.log.warn('Redis SUB disconnected.')
        })
      })
        .then(() => {
          this.connected()
        })
    },
    subscribe (type, nodeId) {
      return new Promise(resolve => {
        const topic = this.getTopic(type, nodeId)
        clientSub.subscribe(topic, () => {
          return resolve()
        })
      })
    },
    send (message) {
      const data = this.serialize(message)
      if (this.isConnected) {
        this.updateStatisticSent(data.length)
        const topic = this.getTopic(message.type, message.targetNodeId)
        clientPub.publish(topic, data)
      }
      return Promise.resolve()
    },
    close () {
      if (clientPub && clientSub) {
        clientPub.quit()
        clientSub.quit()
      }
      return utils.promiseDelay(Promise.resolve(), 500)
    }
  })
}

module.exports = RedisTransportAdapter
