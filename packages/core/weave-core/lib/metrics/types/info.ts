// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'BaseMetric... Remove this comment to see the full error message
const BaseMetricType = require('./base')

module.exports = class Gauge extends BaseMetricType {
  constructor (store, obj) {
    super(store, obj)
    this.values = new Map()
    this.value = 0
  }

  generateSnapshot () {
    return Array.from(this.values)
      .map(([labelString, item]) => {
        return {
          value: item.value,
          labels: item.labels
        }
      })
  }

  set (value, labels, timestamp) {
    const labelString = this.stringifyLabels(labels)
    const item = this.values.get(labelString)

    this.value = value

    if (item) {
      if (item.value !== value) {
        item.labels = labels
        item.value = value
        item.timestamp = timestamp || Date.now()
      }
    } else {
      const item = {
        labels: labels,
        value: value,
        timestamp: timestamp || Date.now()
      }

      this.values.set(labelString, item)
    }
    return item
  }
}
