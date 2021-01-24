import { isString, isFunction } from '@weave-js/utils'
import { WeaveBrokerOptionsError } from '../../errors'

const adapters = {
  Event: require('./event')
}

const getByName = name => {
  if (!name) {
    return null
  }

  const n = Object.keys(adapters).find(n => n.toLowerCase() === name.toLowerCase())

  if (n) {
    return adapters[n]
  }
}

export default {
  resolve (broker, options) {
    let cacheFactory

    if (options === true) {
      cacheFactory = this.adapters.Event
    } else if (isString(options)) {
      const cache = getByName(options)

      if (cache) {
        cacheFactory = cache
      } else {
        throw new WeaveBrokerOptionsError(`Unknown metric adapter: "${options}"`)
      }
    } else if (isFunction(options)) {
      cacheFactory = options
    }

    if (cacheFactory) {
      return cacheFactory
    }
  }
}
