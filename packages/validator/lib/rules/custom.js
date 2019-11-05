module.exports = function customCheck (value, schema) {
    return schema.validate.call(this, value, schema)
}
