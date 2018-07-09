module.exports = {
    formatNumber (value, decimals = 0, sign = false) {
        let result = Number(value.toFixed(decimals)).toLocaleString()
        if (sign && value > 0.0) {
            result = '' + result
        }
        return result
    }
}
