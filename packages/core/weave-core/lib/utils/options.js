
const {
  clone,
  compact,
  deepMerge,
  defaultsDeep,
  flatten,
  wrapHandler,
  wrapInArray
} = require('@weave-js/utils')

function mergeSettings (source, targetSchema) {
  return defaultsDeep(source, targetSchema)
}

function mergeMeta (source, targetSchema) {
  return defaultsDeep(source, targetSchema)
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

function mergeActionHooks (source, target) {
  Object.keys(source).map(hookName => {
    if (!target[hookName]) {
      target[hookName] = {}
    }

    Object.keys(source[hookName]).map(actionName => {
      const sourceHookAction = wrapInArray(source[hookName][actionName])
      const targetHookAction = wrapInArray(target[hookName][actionName])
      target[hookName][actionName] = compact(flatten([sourceHookAction, targetHookAction]))
    })
  })

  return target
}

function mergeLifecicleHooks (source, targetSchema) {
  return compact(flatten([targetSchema, source]))
}

exports.mergeSchemas = (mixin, targetSchema) => {
  const mixinSchema = clone(mixin)
  const resultSchema = clone(targetSchema)

  Object.keys(resultSchema).forEach(key => {
    if (['name', 'version'].includes(key)) {
      // override value
      mixinSchema[key] = resultSchema[key]
    } else if (key === 'dependencies') {
      mixinSchema[key] = mergeUniqueArrays(resultSchema[key], mixinSchema[key])
    } else if (key === 'mixins') {
      mixinSchema[key] = mergeUniqueArrays(resultSchema[key], mixinSchema[key] || {})
    } else if (key === 'settings') {
      mixinSchema[key] = mergeSettings(resultSchema[key], mixinSchema[key])
    } else if (key === 'meta') {
      mixinSchema[key] = mergeMeta(resultSchema[key], mixinSchema[key])
    } else if (key === 'actions') {
      mixinSchema[key] = mergeActions(resultSchema[key], mixinSchema[key] || {})
    } else if (key === 'hooks') {
      mixinSchema[key] = mergeActionHooks(resultSchema[key], mixinSchema[key] || {})
    } else if (key === 'events') {
      mixinSchema[key] = mergeEvents(resultSchema[key], mixinSchema[key] || {})
    } else if (key === 'methods') {
      mixinSchema[key] = mergeMethods(resultSchema[key], mixinSchema[key] || {})
    } else if (['afterSchemasMerged', 'created', 'started', 'stopped'].includes(key)) {
      mixinSchema[key] = mergeLifecicleHooks(resultSchema[key], mixinSchema[key])
    } else {
      // default action for properties
      mixinSchema[key] = resultSchema[key]
    }
  })

  return mixinSchema
}
