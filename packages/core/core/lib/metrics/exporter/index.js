const { isString, isFunction } = require('../../../../utils/lib')
const { WeaveBrokerOptionsError } = require('../../errors')

const adapters = {
  Base: require('./base'),
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

module.exports = {
  ...adapters,
  resolve (options) {
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
