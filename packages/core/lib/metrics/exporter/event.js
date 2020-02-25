module.exports = options => {
  const lastChanges = new Set()
  return {
    init (registry) {
      this.options = Object.assign(options, {
        eventName: '$metrics.changed',
        interval: 5000
      })
      this.registry = registry

      if (this.options.interval > 0) {
        this.timer = setInterval(() => this.sendEvent(), this.options.interval)
        this.timer.unref()
      }
    },
    sendEvent () {
      const broker = this.registry.broker
      const list = this.registry.list()

      broker.emit(this.options.eventName, list)
    },
    metricChanged (metric) {
      lastChanges.add(metric)
    }
  }
}
