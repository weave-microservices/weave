/*
 * Author: Kevin Ries (kevin.ries@fachwerk.io)
 * -----
 * Copyright 2021 Fachwerk
 */
const redis = require('redis')
const { defaultsDeep } = require('@weave-js/utils')
const { TransportAdapters } = require('@weave-js/core')

const defaultOptions = {
  port: 6379,
  host: '127.0.0.1'
}

const RedisTransportAdapter = (adapterOptions) => {
  let clientSub
  let clientPub

  adapterOptions = defaultsDeep(adapterOptions, defaultOptions)

  return Object.assign(TransportAdapters.BaseAdapter(adapterOptions), {
    name: 'REDIS',

    connect () {
      if (clientSub || clientPub) {
        return Promise.reject(new Error('Adapter already connected.'))
      }

      // Ohne explizite Strategie gibt v3 je nach Fehlerbild auf,
      // dann bleibt 'reconnecting' aus. Solange eine Zahl kommt, wird retried.
      const retryStrategy = ({ attempt }) => Math.min(attempt * 100, 3000)

      clientPub = redis.createClient({ ...adapterOptions, retry_strategy: retryStrategy })
      clientSub = redis.createClient({
        ...adapterOptions,
        retry_strategy: retryStrategy,
        return_buffers: true          // binärsichere Payload + korrekte Byte-Statistik
      })

      const isUp = () =>
        Boolean(clientSub && clientSub.ready && clientPub && clientPub.ready)

      const syncState = () => {
        const up = isUp()
        if (up === this.isConnected) return

        this.isConnected = up

        if (up) {
          const attempts = this.repeatAttemptCounter
          this.repeatAttemptCounter = 0
          this.log.info(`Redis reconnected${attempts ? ` after ${attempts} attempts` : ''}.`)
          this.connected({ wasReconnect: true })
        } else {
          this.interruptCounter++
          this.log.warn(`Redis disconnected (SUB: ${clientSub.ready}, PUB: ${clientPub.ready}).`)
          this.disconnected()
        }
      }

      const waitForReady = (client) => new Promise((resolve, reject) => {
        const onReady = () => { client.removeListener('error', onError); resolve() }
        const onError = (error) => { client.removeListener('ready', onReady); reject(error) }
        client.once('ready', onReady)
        client.once('error', onError)
      })

      return Promise.all([waitForReady(clientPub), waitForReady(clientSub)])
        .then(() => {
          this.isConnected = true

          for (const [client, label] of [[clientSub, 'SUB'], [clientPub, 'PUB']]) {
            client.on('ready', syncState)
            client.on('end', syncState)

            client.on('reconnecting', () => {
              this.repeatAttemptCounter++
              this.log.debug(`Redis ${label} reconnecting (attempt ${this.repeatAttemptCounter}).`)
              syncState()
            })

            // Dauerhaft nötig: EventEmitter ohne error-Listener wirft.
            client.on('error', (error) => {
              const detail = !error
                ? '(no error object)'
                : error.message || error.code || error.constructor.name
              this.log.error(`Redis ${label} error: ${detail}`)
              syncState()
            })
          }

          clientSub.on('message', (topic, message) => {
            const type = topic.toString().split('.')[1]
            this.incomingMessage(type, message)
          })

          this.log.info('Redis SUB and PUB clients connected.')
          this.connected()
        })
        .catch((error) => {
          if (clientSub) clientSub.end(true)
          if (clientPub) clientPub.end(true)
          clientSub = clientPub = null
          throw error
        })
    },

    subscribe (type, nodeId) {
      return new Promise((resolve, reject) => {
        const topic = this.getTopic(type, nodeId)
        clientSub.subscribe(topic, (error) => error ? reject(error) : resolve())
      })
    },

    send (message) {
      if (!this.isConnected) {
        this.log.debug('Message dropped, adapter not connected.', { type: message.type })
        return Promise.resolve()
      }

      const data = this.serialize(message)
      if (!data) return Promise.resolve()

      this.updateStatisticSent(data.length)
      clientPub.publish(this.getTopic(message.type, message.targetNodeId), data)

      return Promise.resolve()
    },

    close () {
      const quit = (client) => client
        ? new Promise((resolve) => client.quit(() => resolve()))
        : Promise.resolve()

      return Promise.all([quit(clientPub), quit(clientSub)])
        .then(() => { clientSub = clientPub = null })
    }
  })
}

module.exports = RedisTransportAdapter
