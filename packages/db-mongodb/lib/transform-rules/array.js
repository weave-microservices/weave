module.exports = function transformArray (values, rule) {
    return values.map((value) => {
        return this.transform(rule.contains.type, value, rule)
    })
}
