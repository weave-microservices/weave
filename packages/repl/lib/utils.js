const _ = require('lodash')
const ora = require('ora')

module.exports = {
    formatNumber (value, decimals = 0, sign = false) {
        let result = Number(value.toFixed(decimals)).toLocaleString()
        if (sign && value > 0.0) {
            result = '' + result
        }
        return result
    },
    convertArgs (args) {
        const res = {}
        _.forIn(args, (value, key) => {
            if (Array.isArray(value)) {
                res[key] = value
            } else if (typeof (value) === 'object') {
                res[key] = this.convertArgs(value)
            } else if (value === 'true') {
                res[key] = true
            } else if (value === 'false') {
                res[key] = false
            } else {
                res[key] = value
            }
        })
        return res
    },
    createSpinner (text) {
        return ora({
            text,
            spinner: 'dots'
        })
    },
    humanizeTime: require('tiny-human-time').short
}
