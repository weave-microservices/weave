/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2020 Fachwerk
 */

// npm packages
const { defaultsDeep } = require('lodash')

// own packages
const URIToConfig = require('./URIToConfig')
const TransportBase = require('../adapter-base')
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

  return Object.assign(TransportBase(adapterOptions), {
    name: 'REDIS',
    connect () {
      return new Promise((resolve, reject) => {
        let Redis
        try {
          Redis = require('ioredis')
        } catch (error) {
          this.log.error('The package \'ioredis\' is not installed. Please install the package with \'npm install ioredis\'.')

          error.skipRetry = true
          return reject(error)
        }

        clientSub = new Redis(adapterOptions)

        clientSub.on('connect', () => {
          clientPub = new Redis(adapterOptions)

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
          this.incommingMessage(type, message)
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
        clientSub.subscribe(this.getTopic(type, nodeId), () => {
          return resolve()
        })
      })
    },
    send (message) {
      const data = this.serialize(message)
      if (this.isConnected) {
        this.updateStatisticSent(data.length)
        clientPub.publish(this.getTopic(message.type, message.targetNodeId), data)
      }
      return Promise.resolve()
    },
    close () {
      if (clientPub && clientSub) {
        clientPub.disconnect()
        clientSub.disconnect()
      }
      return utils.promiseDelay(Promise.resolve(), 500)
    }
  })
}

module.exports = RedisTransportAdapter

module.exports.uriToConfig = URIToConfig
