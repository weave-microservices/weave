const BaseMetricType = require('./base')

module.exports = class Gauge extends BaseMetricType {
    // constructor (store, obj) {
    //     super(store, obj)
    // }

    increment (labels, value) {
        const item = this.get(labels)
        this.set(labels, (item ? item.value : 0) + value)
    }

    decrement (value) {
        this.value -= value
    }

    set (labels, value) {
        const labelString = this.stringifyLabels(labels)
        const item = this.values.get(labelString)

        if (item) {
            item.labels = labels
            item.value = value
        } else {
            const item = {
                labels: labels,
                value: value
            }
            this.values.set(labelString, item)
        }
    }

    getSnapshot () {
        return Array.from(this.values).map(item => ({
            value: item.value,
            labels: item.labels
        }))
    }
}
