const { isPlainObject } = require('@weave-js/utils')
const MetricTypes = require('./types')

exports.initMetrics = (runtime) => {
  const options = runtime.options.metrics

  const storage = new Map()

  const log = runtime.createLogger('METRICS')

  Object.defineProperty(runtime, 'metrics', {
    value: {
      runtime,
      options,
      storage,
      log,
      init () {
        // Load adapters
        if (options.adapters) {
          if (!Array.isArray(options.adapters)) {
            runtime.handleError(new Error('Metic adapter needs to be an Array'))
          }

          this.adapters = options.adapters.map(adapter => {
            adapter.init(this)
            return adapter
          })
        }
      },
      register (obj) {
        if (!isPlainObject(obj)) {
          runtime.handleError(new Error('Param needs to be an object.'))
        }

        if (!obj.type) {
          runtime.handleError(new Error('Type is missing.'))
        }

        if (!obj.name) {
          runtime.handleError(new Error('Name is missing.'))
        }

        const createMetricType = MetricTypes.resolve(obj.type)

        if (!createMetricType) {
          runtime.handleError(new Error('Unknown metric type.'))
        }

        const type = createMetricType(this, obj)

        this.storage.set(obj.name, type)

        return type
      },
      increment (name, labels, value = 1, timestamp) {
        const item = this.storage.get(name)

        if (!item) {
          runtime.handleError(new Error('Item not found.'))
        }

        item.increment(labels, value, timestamp)
      },
      decrement (name, labels, value = 1, timestamp) {
        const item = this.storage.get(name)

        if (!item) {
          runtime.handleError(new Error('Item not found.'))
        }

        item.decrement(labels, value, timestamp)
      },
      timer (name, labels, timestamp) {
        // const item = this.storage.get(name)
        // if (item) {

        // }
        // item.observe(labels, value, timestamp)
      },
      getMetric (name) {
        const item = this.storage.get(name)

        if (!item) {
          runtime.handleError(new Error('Item not found.'))
        }

        return item
      },
      list (options = {}) {
        const results = []

        this.storage.forEach(metric => {
          results.push(metric.toObject())
        })

        return results
      }
    }
  })

  return
}
