
const { wrapInArray, clone, compact, flatten, deepMerge, wrapHandler } = require('./utils')

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
    const sourceEvent = wrapHandler(source[key])
    const targetEvent = wrapHandler(targetSchema[key])

    let handler = compact(flatten([sourceEvent ? sourceEvent.handler : null, targetEvent ? targetEvent.handler : null]))
    if (handler.length === 1) {
      handler = handler[0]
    }

    targetSchema[key] = deepMerge(sourceEvent, targetEvent)
    targetSchema[key].handler = handler
  })
  return targetSchema
}

function mergeMethods (source, targetSchema) {
  return Object.assign(source, targetSchema)
}

function mergeSettings (source, targetSchema) {
  return Object.assign(source, targetSchema)
}

function mergeActionHooks (source, target) {
  Object.keys(source).map(hookName => {
    if (target[hookName] === null) {
      target[hookName] = {}
    }

    Object.keys(source[hookName]).map(actionName => {
      const sourceHookAction = wrapHandler(source[hookName][actionName])
      const targetHookAction = wrapHandler(target[hookName][actionName])

      target[hookName][actionName] = compact(flatten([sourceHookAction, targetHookAction]))
    })
  })
  targetSchema
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
      targetSchema[key] = mergeActionHooks(sourceSchema[key], targetSchema[key] || {})
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
