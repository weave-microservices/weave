/**
 * @typedef {import('../../types').ServiceSchema} ServiceSchema
 */

const {
  clone,
  compact,
  deepMerge,
  defaultsDeep,
  flatten,
  wrapInArray
} = require('@weave-js/utils');

const { wrapHandler } = require('../utils/wrap-handler');

/**
 * Merge service settings with deep default merging
 * @param {Object} source Source settings object
 * @param {Object} targetSchema Target schema settings
 * @returns {Object} Merged settings object
 */
function mergeSettings (source, targetSchema) {
  return defaultsDeep(source, targetSchema);
}

/**
 * Merge service metadata with deep default merging
 * @param {Object} source Source metadata object
 * @param {Object} targetSchema Target schema metadata
 * @returns {Object} Merged metadata object
 */
function mergeMeta (source, targetSchema) {
  return defaultsDeep(source, targetSchema);
}

/**
 * Merge arrays ensuring unique values
 * @param {Array} source Source array
 * @param {Array} targetSchema Target schema array
 * @returns {Array} Flattened and compacted unique array
 */
function mergeUniqueArrays (source, targetSchema) {
  return compact(flatten([targetSchema, source]));
}

/**
 * Merge service actions with handler wrapping and conflict resolution
 * @param {Object} source Source actions object
 * @param {Object} targetSchema Target schema actions
 * @returns {Object} Merged actions object with wrapped handlers
 */
function mergeActions (source, targetSchema) {
  Object.keys(source).map(key => {
    // prevent action merge
    if (source[key] === false && targetSchema[key]) {
      delete targetSchema[key];
      return;
    }

    const sourceAction = wrapHandler(source[key]);
    const targetSchemaAction = wrapHandler(targetSchema[key]);

    targetSchema[key] = deepMerge(sourceAction, targetSchemaAction);
  });

  return targetSchema;
}

/**
 * Merge service events with handler composition
 * @param {Object} source Source events object
 * @param {Object} targetSchema Target schema events
 * @returns {Object} Merged events object with composed handlers
 */
function mergeEvents (source, targetSchema) {
  Object.keys(source).map(key => {
    const sourceEvent = wrapHandler(source[key]);
    const targetEvent = wrapHandler(targetSchema[key]);

    let handler = compact(flatten([sourceEvent ? sourceEvent.handler : null, targetEvent ? targetEvent.handler : null]));
    if (handler.length === 1) {
      handler = handler[0];
    }

    targetSchema[key] = deepMerge(sourceEvent, targetEvent);
    targetSchema[key].handler = handler;
  });
  return targetSchema;
}

/**
 * Merge service methods by object assignment
 * @param {Object} source Source methods object
 * @param {Object} targetSchema Target schema methods
 * @returns {Object} Merged methods object
 */
function mergeMethods (source, targetSchema) {
  return Object.assign(source, targetSchema);
}

/**
 * Merge action hooks by combining hook arrays
 * @param {Object} source Source action hooks object
 * @param {Object} target Target action hooks object
 * @returns {Object} Merged action hooks with combined arrays
 */
function mergeActionHooks (source, target) {
  Object.keys(source).map(hookName => {
    if (!target[hookName]) {
      target[hookName] = {};
    }

    Object.keys(source[hookName]).map(actionName => {
      const sourceHookAction = wrapInArray(source[hookName][actionName]);
      const targetHookAction = wrapInArray(target[hookName][actionName]);
      target[hookName][actionName] = compact(flatten([sourceHookAction, targetHookAction]));
    });
  });

  return target;
}

/**
 * Merge lifecycle hooks into a flattened array
 * @param {Array|Function} source Source lifecycle hooks
 * @param {Array|Function} targetSchema Target schema lifecycle hooks
 * @returns {Array} Flattened and compacted lifecycle hooks array
 */
function mergeLifecicleHooks (source, targetSchema) {
  return compact(flatten([targetSchema, source]));
}

/**
 * Merge service schemas with comprehensive property handling
 *
 * Handles different merge strategies for various schema properties:
 * - name, version: Override values
 * - dependencies, mixins: Merge unique arrays
 * - settings, meta: Deep merge objects
 * - actions, events: Merge with handler wrapping
 * - hooks: Merge action hooks by combining arrays
 * - lifecycle hooks: Flatten into arrays
 * - methods: Object assignment
 *
 * @param {ServiceSchema} mixin Mixin service schema
 * @param {ServiceSchema} targetSchema Target service schema to merge into
 * @returns {ServiceSchema} Merged service schema with combined properties
 */
function mergeSchemas (mixin, targetSchema) {
  const mixinSchema = clone(mixin);
  const resultSchema = clone(targetSchema);

  Object.keys(resultSchema).forEach(key => {
    if (['name', 'version'].includes(key)) {
      // override value
      mixinSchema[key] = resultSchema[key];
    } else if (key === 'dependencies') {
      mixinSchema[key] = mergeUniqueArrays(resultSchema[key], mixinSchema[key]);
    } else if (key === 'mixins') {
      mixinSchema[key] = mergeUniqueArrays(resultSchema[key], mixinSchema[key] || {});
    } else if (key === 'settings') {
      mixinSchema[key] = mergeSettings(resultSchema[key], mixinSchema[key]);
    } else if (key === 'meta') {
      mixinSchema[key] = mergeMeta(resultSchema[key], mixinSchema[key]);
    } else if (key === 'actions') {
      mixinSchema[key] = mergeActions(resultSchema[key], mixinSchema[key] || {});
    } else if (key === 'hooks') {
      mixinSchema[key] = mergeActionHooks(resultSchema[key], mixinSchema[key] || {});
    } else if (key === 'events') {
      mixinSchema[key] = mergeEvents(resultSchema[key], mixinSchema[key] || {});
    } else if (key === 'methods') {
      mixinSchema[key] = mergeMethods(resultSchema[key], mixinSchema[key] || {});
    } else if (['afterSchemasMerged', 'created', 'started', 'stopped'].includes(key)) {
      mixinSchema[key] = mergeLifecicleHooks(resultSchema[key], mixinSchema[key]);
    } else {
      // default action for properties
      mixinSchema[key] = resultSchema[key];
    }
  });

  return mixinSchema;
}

module.exports = { mergeSchemas };
