const { isPlainObject } = require('../utils')
const MetricTypes = require('./types')

module.exports = (broker, options) => {
  return {
    broker,
    log: broker.createLogger('Metrics'),
    init () {
      this.storage = new Map()

      if (options.adapters) {
        if (!Array.isArray(options.adapters)) {
          throw new Error('Metic adapter needs to be an Array')
        }

        this.adapters = options.adapters.map(adapter => {
          adapter.init(this)
          return adapter
        })
      }

      this.log.debug('Metrics initialized.')
    },
    register (obj) {
      if (!isPlainObject(obj)) {
        throw new Error('Param needs to be an object.')
      }

      if (!obj.name) {
        throw new Error('Name is missing.')
      }

      const MetricType = MetricTypes.resolve(obj.type)

      if (!MetricType) {
        throw new Error('Unknown metric type.')
      }

      const type = new MetricType(this, obj)
      this.storage.set(obj.name, type)
      return type
    },
    increment (name, labels, value = 1, timestamp) {
      const item = this.storage.get(name)
      if (!item) {
        throw new Error('Item not found.')
      }
      item.increment(labels, value, timestamp)
    },
    decrement (name, labels, value = 1, timestamp) {
      const item = this.storage.get(name)
      if (!item) {
        throw new Error('Item not found.')
      }
      item.decrement(labels, value, timestamp)
    },
    getMetric (name) {
      const item = this.storage.get(name)
      if (!item) {
        throw new Error('Item not found.')
      }
      return item
    },
    list () {
      const results = Array.from(this.storage).map(([name, metric]) => {
        return {
          values: metric.toObject()
        }
      })

      return results
    }
  }
}
