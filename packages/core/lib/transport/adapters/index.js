/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2020 Fachwerk
 */

const { WeaveBrokerOptionsError } = require('../../errors')
const fromURI = require('./fromURI')
const getAdapterByName = require('./getAdapterByName')
const adapters = require('./adapters')

const resolve = options => {
  if (typeof options === 'object') {
    if (typeof options.adapter === 'string') {
      const Adapter = getAdapterByName(options.adapter)

      if (Adapter) {
        return Adapter(options.options)
      } else {
        throw new WeaveBrokerOptionsError(`Invalid transport settings: ${options.adapter}`)
      }
    }
    return options.adapter
  }
  //  else if (typeof options === 'string') {
  //     let Adapter = getAdapterByName(options)

  //     if (Adapter) {
  //         return Adapter()
  //     }

  //     if (options.startsWith('dummy://')) {
  //         Adapter = adapters.Dummy
  //     } else if (options.startsWith('redis://')) {
  //         Adapter = adapters.Redis
  //     } else if (options.startsWith('nats://')) {
  //         Adapter = adapters.NATS
  //     }

  //     if (Adapter) {
  //         return Adapter(options)
  //     } else {
  //         throw new WeaveBrokerOptionsError(`Invalid transport settings: ${options}`, { type: options })
  //     }
  // }
  return null
}

module.exports = Object.assign({ resolve, fromURI }, adapters)
