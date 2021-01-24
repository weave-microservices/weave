import BaseMetricType from './base'
export default class Gauge extends BaseMetricType {
  value: number;
  
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
          labels: item.labels,
          labelString
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
