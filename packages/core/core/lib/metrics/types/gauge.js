const { createBaseMetricType } = require('./base')

exports.createGauge = (registry, obj) => {
  const base = createBaseMetricType(registry, obj)

  base.value = 0

  base.increment = (labels, value, timestamp) => {
    const item = base.values.get(labels)
    base.set((item ? item.value : 0) + value, labels, timestamp)
  }

  base.decrement = (labels, value, timestamp) => {
    const item = base.get(labels)
    base.set((item ? item.value : 0) - value, labels, timestamp)
  }

  base.generateSnapshot = () => {
    return Array.from(base.values)
      .map(([labelString, item]) => {
        return {
          value: item.value,
          labels: item.labels
        }
      })
  }

  base.set = (value, labels, timestamp = Date.now()) => {
    const labelString = base.stringifyLabels(labels)
    let item = base.values.get(labelString)

    base.value = value

    if (item) {
      if (item.value !== value) {
        item.labels = labels
        item.value = value
        item.timestamp = timestamp
      }
    } else {
      item = {
        labels,
        value,
        timestamp
      }

      base.values.set(labelString, item)
    }
    return item
  }

  return base
}
