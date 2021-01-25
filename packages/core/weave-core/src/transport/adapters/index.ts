/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2020 Fachwerk
 */

import { WeaveBrokerOptionsError } from '../../errors'
import fromURI from './fromURI'
import { getAdapterByName } from './getAdapterByName'
import * as adapters from './adapters'

const resolve = (broker, options) => {
  if (typeof options === 'object') {
    if (typeof options.adapter === 'string') {
      const Adapter = getAdapterByName(options.adapter)

      if (Adapter) {
        return Adapter(options.options)
      } else {
        broker.handleError(new WeaveBrokerOptionsError(`Invalid transport settings: ${options.adapter}`))
      }
    }
    return options.adapter
  }

  return null
}

export default Object.assign({ resolve, fromURI }, adapters)
