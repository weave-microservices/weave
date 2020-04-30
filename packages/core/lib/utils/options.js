
const { wrapInArray, cloneObject, compact, flatten } = require('./utils')

function updateProp (propName, target, source) {
  if (source[propName] !== undefined) {
    target[propName] = source[propName]
  }
}
function mergeMeta (source, target) {
  return Object.assign(source, target)
}
function mergeUniqueArrays (source, target) {
  compact(flatten([target, source]))
}

function mergeActions (source, target) {
  return Object.assign(source, target)
}

function mergeLifecicleHooks (source, target) {
  return compact(flatten([target, source]))
}

function mergeHook (parentValue, childValue) {
  if (childValue) {
    if (parentValue) {
      if (Array.isArray(parentValue)) {
        return parentValue.concat(childValue)
      } else {
        return [parentValue, childValue]
      }
    } else {
      return wrapInArray(childValue)
    }
  }

  return childValue
    ? Array.isArray(parentValue)
      ? parentValue.concat(childValue)
      : Array.isArray(childValue)
        ? childValue
        : [childValue]
    : parentValue
}

module.exports.mergeSchemas = (childSchema, parentSchema) => {
  const target = Object.assign({}, childSchema)
  const sourceSchema = Object.assign({}, parentSchema)

  Object.keys(sourceSchema).forEach(key => {
    if (['name', 'version'].includes(key)) {
      // override value
      target[key] = sourceSchema[key]
    } else if (key === 'dependencies') {
      target[key] = mergeUniqueArrays(sourceSchema[key], target[key] || {})
    } else if (key === 'mixins') {
      target[key] = mergeUniqueArrays(sourceSchema[key], target[key] || {})
    } else if (key === 'settings') {
      target[key] = mergeSettings(sourceSchema[key], target[key])
    } else if (key === 'meta') {
      target[key] = mergeMeta(sourceSchema[key], target[key])
    } else if (key === 'actions') {
      target[key] = mergeActions(sourceSchema[key], target[key] || {})
    } else if (key === 'hooks') {
      target[key] = mergeHooks(sourceSchema[key], target[key])
    } else if (key === 'events') {
      target[key] = mergeEvents(sourceSchema[key], target[key] || {})
    } else if (key === 'methods') {
      target[key] = mergeMethods(sourceSchema[key], target[key] || {})
    } else if (['started', 'stopped', 'created'].includes(key)) {
      target[key] = mergeLifecicleHooks(sourceSchema[key], target[key])
    } else {

    }
  })

  return target
}