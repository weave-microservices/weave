const { createBaseMetricAdapter } = require('./base')

module.exports = (options) => {
  const lastChanges = new Set()

  const adapter = createBaseMetricAdapter(options)

  const sendEvent = (registry, options) => {
    const broker = registry.broker
    const list = this.registry.list()

    broker.emit(this.options.eventName, list)

    lastChanges.clear()
  }

  adapter.init = (registry) => {
    this.options = Object.assign(options, {
      eventName: '$metrics.changed',
      interval: 5000
    })

    this.registry = registry

    if (this.options.interval > 0) {
      this.timer = setInterval(() => sendEvent(), this.options.interval)
      this.timer.unref()
    }
  }

  adapter.stop = () => {
    clearInterval(this.timer)
    return Promise.resolve()
  }

  adapter.metricChanged = (metric) => {
    lastChanges.add(metric)
  }

  return adapter
}
