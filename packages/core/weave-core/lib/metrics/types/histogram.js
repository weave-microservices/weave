const { createBaseMetricType } = require('./base')

exports.createHistogram = (registry, obj) => {
  const base = createBaseMetricType(registry, obj)

  base.value = 0

  // create default buckets
  if (obj.buckets) {
    base.buckets = registry.options.defaultBuckets
  }

  base.buckets = base.buckets.sort((a, b) => a - b)


  base.observe = (value, labels, timestamp) => {
    const labelString = base.stringifyLabels(labels)

    const item = base.values.get(labelString)

    if (!value) {

    }

    base.set(labels, (item ? item.value : 0) + value)
  }

  base.decrement = (labels, value, timestamp) => {
    const item = base.get(labels)

    base.set(labels, (item ? item.value : 0) - value)
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

  base.set = (labels, value, timestamp) => {
    const labelString = base.stringifyLabels(labels)
    const item = base.values.get(labelString)

    base.value = value

    if (item) {
      if (item.value !== value) {
        item.labels = labels
        item.value = value
      }
    } else {
      const item = {
        labels: labels,
        value: value
      }

      base.values.set(labelString, item)
    }
    return item
  }


  return base
}

