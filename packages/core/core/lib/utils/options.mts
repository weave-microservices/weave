import type {
  ServiceSchema,
  ServiceSettings,
  ServiceHooks,
  ServiceActionSchema,
  ServiceActionHandler,
  ServiceEventSchema,
  ServiceMethodDefinition,
  ServiceLifecycleHook,
} from "../../types/index.js";

import { clone, compact, deepMerge, defaultsDeep, flatten, wrapInArray } from "@weave-js/utils";

import { wrapHandler } from "../utils/wrap-handler.mts";

/**
 * Internal schema type with index signature for dynamic key access
 */
type ServiceSchemaInternal = ServiceSchema & {
  [key: string]: unknown;
};

/**
 * Actions record type
 */
type ActionsRecord = Record<string, ServiceActionSchema | ServiceActionHandler | boolean>;

/**
 * Events record type
 */
type EventsRecord = Record<string, ServiceEventSchema>;

/**
 * Methods record type
 */
type MethodsRecord = Record<string, ServiceMethodDefinition>;

/**
 * Action hooks record type - maps hook names (before/after/error) to action-specific handlers
 */
type ActionHooksRecord = Record<string, Record<string, unknown>>;

/**
 * Lifecycle hooks type - can be single function or array of functions
 */
type LifecycleHooks = ServiceLifecycleHook | ServiceLifecycleHook[];

/**
 * Merge service settings with deep default merging
 * @param source Source settings object
 * @param targetSchema Target schema settings
 * @returns Merged settings object
 */
function mergeSettings(
  source: ServiceSettings,
  targetSchema: ServiceSettings | undefined,
): ServiceSettings {
  return defaultsDeep(source, targetSchema);
}

/**
 * Merge service metadata with deep default merging
 * @param source Source metadata object
 * @param targetSchema Target schema metadata
 * @returns Merged metadata object
 */
function mergeMeta(
  source: Record<string, unknown>,
  targetSchema: Record<string, unknown> | undefined,
): Record<string, unknown> {
  return defaultsDeep(source, targetSchema);
}

/**
 * Merge arrays ensuring unique values
 * @param source Source array
 * @param targetSchema Target schema array
 * @returns Flattened and compacted unique array
 */
function mergeUniqueArrays<T>(source: T[] | undefined, targetSchema: T[] | undefined): T[] {
  return compact(flatten([targetSchema, source])) as T[];
}

/**
 * Merge service actions with handler wrapping and conflict resolution
 * @param source Source actions object
 * @param targetSchema Target schema actions
 * @returns Merged actions object with wrapped handlers
 */
function mergeActions(source: ActionsRecord, targetSchema: ActionsRecord): ActionsRecord {
  Object.keys(source).map((key: string) => {
    // prevent action merge
    if (source[key] === false && targetSchema[key]) {
      delete targetSchema[key];
      return;
    }

    const sourceAction = wrapHandler(source[key] as ServiceActionHandler);
    const targetSchemaAction = wrapHandler(targetSchema[key] as ServiceActionHandler);

    targetSchema[key] = deepMerge(sourceAction, targetSchemaAction);
  });

  return targetSchema;
}

/**
 * Merge service events with handler composition
 * @param source Source events object
 * @param targetSchema Target schema events
 * @returns Merged events object with composed handlers
 */
function mergeEvents(source: EventsRecord, targetSchema: EventsRecord): EventsRecord {
  Object.keys(source).map((key: string) => {
    const sourceEvent = wrapHandler(source[key] as (...args: unknown[]) => unknown);
    const targetEvent = wrapHandler(targetSchema[key] as (...args: unknown[]) => unknown);

    let handler: unknown = compact(
      flatten([sourceEvent ? sourceEvent.handler : null, targetEvent ? targetEvent.handler : null]),
    );
    if (Array.isArray(handler) && handler.length === 1) {
      handler = handler[0];
    }

    targetSchema[key] = deepMerge(sourceEvent, targetEvent) as ServiceEventSchema;
    (targetSchema[key] as Record<string, unknown>).handler = handler;
  });
  return targetSchema;
}

/**
 * Merge service methods by object assignment
 * @param source Source methods object
 * @param targetSchema Target schema methods
 * @returns Merged methods object
 */
function mergeMethods(source: MethodsRecord, targetSchema: MethodsRecord): MethodsRecord {
  return Object.assign(source, targetSchema);
}

/**
 * Merge action hooks by combining hook arrays
 * @param source Source action hooks object
 * @param target Target action hooks object
 * @returns Merged action hooks with combined arrays
 */
function mergeActionHooks(source: ServiceHooks, target: ServiceHooks): ServiceHooks {
  const sourceRecord = source as ActionHooksRecord;
  const targetRecord = target as ActionHooksRecord;

  Object.keys(sourceRecord).map((hookName: string) => {
    if (!targetRecord[hookName]) {
      targetRecord[hookName] = {};
    }

    Object.keys(sourceRecord[hookName]).map((actionName: string) => {
      const sourceHookAction = wrapInArray(sourceRecord[hookName][actionName]);
      const targetHookAction = wrapInArray(targetRecord[hookName][actionName]);
      targetRecord[hookName][actionName] = compact(flatten([sourceHookAction, targetHookAction]));
    });
  });

  return targetRecord as ServiceHooks;
}

/**
 * Merge lifecycle hooks into a flattened array
 * @param source Source lifecycle hooks
 * @param targetSchema Target schema lifecycle hooks
 * @returns Flattened and compacted lifecycle hooks array
 */
function mergeLifecicleHooks(
  source: LifecycleHooks | undefined,
  targetSchema: LifecycleHooks | undefined,
): ServiceLifecycleHook[] {
  return compact(flatten([targetSchema, source])) as ServiceLifecycleHook[];
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
 * @param mixin Mixin service schema
 * @param targetSchema Target service schema to merge into
 * @returns Merged service schema with combined properties
 */
function mergeSchemas(mixin: ServiceSchema, targetSchema: ServiceSchema): ServiceSchema {
  const mixinSchema = clone(mixin) as ServiceSchemaInternal;
  const resultSchema = clone(targetSchema) as ServiceSchemaInternal;

  Object.keys(resultSchema).forEach((key: string) => {
    if (["name", "version"].includes(key)) {
      // override value
      mixinSchema[key] = resultSchema[key];
    } else if (key === "dependencies") {
      mixinSchema[key] = mergeUniqueArrays(
        resultSchema[key] as string[] | undefined,
        mixinSchema[key] as string[] | undefined,
      );
    } else if (key === "mixins") {
      mixinSchema[key] = mergeUniqueArrays(
        resultSchema[key] as ServiceSchema[] | undefined,
        (mixinSchema[key] as ServiceSchema[] | undefined) || [],
      );
    } else if (key === "settings") {
      mixinSchema[key] = mergeSettings(
        resultSchema[key] as ServiceSettings,
        mixinSchema[key] as ServiceSettings | undefined,
      );
    } else if (key === "meta") {
      mixinSchema[key] = mergeMeta(
        resultSchema[key] as Record<string, unknown>,
        mixinSchema[key] as Record<string, unknown> | undefined,
      );
    } else if (key === "actions") {
      mixinSchema[key] = mergeActions(
        resultSchema[key] as ActionsRecord,
        (mixinSchema[key] as ActionsRecord) || {},
      );
    } else if (key === "hooks") {
      mixinSchema[key] = mergeActionHooks(
        resultSchema[key] as ServiceHooks,
        (mixinSchema[key] as ServiceHooks) || {},
      );
    } else if (key === "events") {
      mixinSchema[key] = mergeEvents(
        resultSchema[key] as EventsRecord,
        (mixinSchema[key] as EventsRecord) || {},
      );
    } else if (key === "methods") {
      mixinSchema[key] = mergeMethods(
        resultSchema[key] as MethodsRecord,
        (mixinSchema[key] as MethodsRecord) || {},
      );
    } else if (["afterSchemasMerged", "created", "started", "stopped"].includes(key)) {
      mixinSchema[key] = mergeLifecicleHooks(
        resultSchema[key] as LifecycleHooks | undefined,
        mixinSchema[key] as LifecycleHooks | undefined,
      );
    } else {
      // default action for properties
      mixinSchema[key] = resultSchema[key];
    }
  });

  return mixinSchema as ServiceSchema;
}

export { mergeSchemas };
