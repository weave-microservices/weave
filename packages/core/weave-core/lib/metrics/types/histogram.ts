import BaseMetricType from './base'
module.exports = class Histogram extends BaseMetricType {
  value: number;
  buckets: Array<number>

  constructor (registry, obj) {
    super(registry, obj)
    this.value = 0

    // create default buckets
    if (obj.buckets) {
      this.buckets = registry.options.defaultBuckets
    }

    this.buckets = this.buckets.sort((a, b) => a - b)
  }

  observe (value, labels, timestamp) {
    const labelString = this.stringifyLabels(labels)

    const item = this.values.get(labelString)

    if (!value) {

    }

    this.set(labels, (item ? item.value : 0) + value)
  }

  decrement (labels, value, timestamp) {
    const item = this.get(labels)

    this.set(labels, (item ? item.value : 0) - value)
  }

  generateSnapshot () {
    return Array.from(this.values.keys()).map((key) => {
      const item = this.values.get(key);
      return {
        key,
        value: item.value,
        labels: item.labels
      }
    })
  }

  set (labels, value, timestamp?: number) {
    const labelString = this.stringifyLabels(labels)
    const item = this.values.get(labelString)

    this.value = value

    if (item) {
      if (item.value !== value) {
        item.labels = labels
        item.value = value
        item.timestamp = timestamp == null ? Date.now() : timestamp
      }
    } else {
      const item = {
        labels: labels,
        value: value,
        timestamp: timestamp == null ? Date.now() : timestamp

      }

      this.values.set(labelString, item)
    }
    return item
  }
}
