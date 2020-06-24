module.exports = class BaseMetricType {
  constructor (storage, obj) {
    this.name = obj.name
    this.description = obj.description
    this.labels = obj.labels || []
    this.type = obj.type
  }

  stringifyLabels (labels) {
    if (this.labels.length === 0 || labels === null) {
      return ''
    }

    const parts = []

    labels.forEach(label => {
      if (typeof label === 'number') {
        parts.push(label)
      } else if (typeof label === 'string') {
        parts.push(label)
      } else {
        parts.push('')
      }
    })
    return parts.join('|')
  }

  get (labels) {
    const labelString = this.stringifyLabels(labels)
    return this.values.get(labelString)
  }

  snapshot () {
    return this.generateSnapshot()
  }

  toObject () {
    return {
      type: this.type,
      name: this.name,
      description: this.description,
      value: this.snapshot()
    }
  }
}
