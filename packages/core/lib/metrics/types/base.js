module.exports = class BaseMetricType {
    constructor (storage, obj) {
        this.values = new Map()
        this.name = obj.name
        this.labels = obj.labels || []
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

    toObject () {
        return {
            type: this.type,
            name: this.name,
            value: ''
        }
    }
}
