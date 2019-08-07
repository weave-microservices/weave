const { isPlainObject } = require('../utils')
const MetricTypes = require('./types')

module.exports = (broker, options) => {
    return {
        log: broker.createLogger('metrics'),
        init () {
            this.log.debug('Metrics initialized.')
            this.storage = new Map()
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
        decrement (name, labels, value = 1) {
            const item = this.storage.get(name)
            if (!item) {
                throw new Error('Item not found.')
            }
            item.decrement(value)
        },
        getMetric (name) {
            const item = this.storage.get(name)
            if (!item) {
                throw new Error('Item not found.')
            }
            return item
        },
        getSnapshot () {
            const results = []
            this.storage.forEach(metric => {

            })
            return results
        }
    }
}
