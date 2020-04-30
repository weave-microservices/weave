
const { wrapInArray, clone, compact, flatten, isFunction, deepMerge } = require('./utils')

const wrapHandler = action => isFunction(action) ? { handler: action } : action

function mergeMeta (source, targetSchema) {
  return Object.assign(source, targetSchema)
}

function mergeUniqueArrays (source, targetSchema) {
  return compact(flatten([targetSchema, source]))
}

function mergeActions (source, targetSchema) {
  Object.keys(source).map(key => {
    // prevent action merge
    if (source[key] === false && targetSchema[key]) {
      delete targetSchema[key]
      return
    }

    const sourceAction = wrapHandler(source[key])
    const targetSchemaAction = wrapHandler(targetSchema[key])

    targetSchema[key] = deepMerge(sourceAction, targetSchemaAction)
  })

  return targetSchema
}

function mergeEvents (source, targetSchema) {
  Object.keys(source).map(key => {

  })
  return Object.assign(source, targetSchema)
}

function mergeMethods (source, targetSchema) {
  return Object.assign(source, targetSchema)
}

function mergeSettings (source, targetSchema) {
  return Object.assign(source, targetSchema)
}

function mergeActionHooks (source, targetSchema) {
  return compact(flatten([targetSchema, source]))
}

function mergeLifecicleHooks (source, targetSchema) {
  const flat = flatten([targetSchema, source])
  const comp = compact(flat)
  return comp
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
  const targetSchema = clone(childSchema)
  const sourceSchema = clone(parentSchema)

  Object.keys(sourceSchema).forEach(key => {
    if (['name', 'version'].includes(key)) {
      // override value
      targetSchema[key] = sourceSchema[key]
    } else if (key === 'dependencies') {
      targetSchema[key] = mergeUniqueArrays(sourceSchema[key], targetSchema[key])
    } else if (key === 'mixins') {
      targetSchema[key] = mergeUniqueArrays(sourceSchema[key], targetSchema[key] || {})
    } else if (key === 'settings') {
      targetSchema[key] = mergeSettings(sourceSchema[key], targetSchema[key])
    } else if (key === 'meta') {
      targetSchema[key] = mergeMeta(sourceSchema[key], targetSchema[key])
    } else if (key === 'actions') {
      targetSchema[key] = mergeActions(sourceSchema[key], targetSchema[key] || {})
    } else if (key === 'hooks') {
      targetSchema[key] = mergeActionHooks(sourceSchema[key], targetSchema[key])
    } else if (key === 'events') {
      targetSchema[key] = mergeEvents(sourceSchema[key], targetSchema[key] || {})
    } else if (key === 'methods') {
      targetSchema[key] = mergeMethods(sourceSchema[key], targetSchema[key] || {})
    } else if (['started', 'stopped', 'created'].includes(key)) {
      targetSchema[key] = mergeLifecicleHooks(sourceSchema[key], targetSchema[key])
    } else {
      
    }
  })

  return targetSchema
}
