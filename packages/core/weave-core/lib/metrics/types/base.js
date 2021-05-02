// module.exports = class BaseMetricType {
//   constructor (registry, obj) {
//     this.registry = registry
//     this.name = obj.name
//     this.description = obj.description
//     this.values = new Map()
//     this.labels = obj.labels || []
//     this.type = obj.type
//   }

//   stringifyLabels (labels) {
//     if (this.labels.length === 0 || labels === null || typeof labels !== 'object') {
//       return ''
//     }

//     const parts = []

//     this.labels.forEach(labelName => {
//       const value = labels[labelName]
//       if (typeof value === 'number') {
//         parts.push(value)
//       } else if (typeof value === 'string') {
//         parts.push(value)
//       } else if (typeof value === 'boolean') {
//         parts.push('' + value)
//       } else {
//         parts.push('')
//       }
//     })

//     return parts.join('|')
//   }

//   get (labels) {
//     const labelString = this.stringifyLabels(labels)
//     return this.values.get(labelString)
//   }

//   snapshot () {
//     return this.generateSnapshot()
//   }

//   toObject () {
//     return {
//       type: this.type,
//       name: this.name,
//       description: this.description,
//       value: this.snapshot()
//     }
//   }
// }



exports.createBaseMetricType = (metricRegistry, obj) => {
  const base = Object.assign({}, {
    name: obj.name,
    description: obj.description,
    values: new Map(),
    labels: obj.labels || [],
    type: obj.type
  })

  base.stringifyLabels = (labels) => {
    if (base.labels.length === 0 || labels === null || typeof labels !== 'object') {
      return ''
    }

    const parts = []

    base.labels.forEach(labelName => {
      const value = labels[labelName]
      if (typeof value === 'number') {
        parts.push(value)
      } else if (typeof value === 'string') {
        parts.push(value)
      } else if (typeof value === 'boolean') {
        parts.push('' + value)
      } else {
        parts.push('')
      }
    })

    return parts.join('|')
  }

  base.get = (labels) => {
    const labelString = base.stringifyLabels(labels)
    return base.values.get(labelString)
  }

  base.snapshot = () => {
    return base.generateSnapshot()
  }

  base.toObject = () => {
    return {
      type: base.type,
      name: base.name,
      description: base.description,
      value: base.snapshot()
    }
  }

  return base
}
