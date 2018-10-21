const fs = require('fs')
const path = require('path')

function ModelTransform (schema) {
    const transformers = {}

    if (typeof schema !== 'object') {
        throw new Error('Invalid Schema!')
    }

    fs.readdirSync(path.join(__dirname, 'transform-rules')).forEach(file => {
        const fileName = path.parse(file).name
        transformers[fileName] = require(path.join(__dirname, 'transform-rules', file))
    })

    const internal = {
        resolveMessage (error) {
            return error
        },
        transform (type, value, schema) {
            if (transformers[type]) {
                return transformers[type].call(this, value, schema)
            } else {
                return value
            }
        }
    }

    return {
        transform (obj) {
            return new Promise((resolve) => {
                Object.keys(schema).forEach((key) => {
                    if (obj[key]) {
                        const rule = schema[key]
                        const transformer = transformers[rule.type]
                        if (transformer) {
                            obj[key] = transformer.call(internal, obj[key], rule)
                        }
                    }
                })
                return resolve(obj)
            })
        },
        addRule (type, ruleFn) {
            if (typeof ruleFn !== 'function') {
                throw new Error('Rule must be a function.')
            }
            transformers[type] = ruleFn
        }
    }
}

module.exports = ModelTransform
