module.exports = function transformObject (values, rule) {
    if (!rule.props) return
    const objectKeys = Object.keys(values)
    const objectRules = rule.props
    const result = {}
    for (let i = 0; i < objectKeys.length; i++) {
        const key = objectKeys[i]
        const rule = objectRules[key]
        const value = values[key]
        if (rule) {
            result[key] = this.transform(rule.type, value, rule)
        }
    }
    return result
}
