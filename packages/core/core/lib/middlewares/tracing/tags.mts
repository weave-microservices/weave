import { isFunction, dotGet, isObject } from "@weave-js/utils";
import type {
  ActionTracingOptions,
  Context,
  EventTracingOptions,
  TracingTagsOptions,
} from "../../../types/index.js";

interface ActionTags {
  requestLevel: number;
  action: { name: string; shortName: string } | null;
  isRemoteCall: boolean;
  nodeId: string;
  requestId?: string;
  data?: unknown;
  meta?: unknown;
}

interface EventTags {
  requestLevel: number;
  event?: string;
  eventType?: string;
  isRemoteCall: boolean;
  nodeId: string;
  requestId?: string;
  data?: unknown;
  meta?: unknown;
}

interface ResponseTags {
  isCachedResult?: boolean;
  response?: unknown;
}

function addPreHandleTagsFromDefinition(
  context: Context,
  tags: ActionTags | EventTags,
  globalTracingActionOptions: TracingTagsOptions | undefined,
  actionTracingOptions: ActionTracingOptions | EventTracingOptions,
): void {
  const globalActionTags = globalTracingActionOptions?.tags;
  let actionTags: Record<string, unknown> | ((ctx: Context) => Record<string, unknown>);

  if (isFunction(actionTracingOptions.tags)) {
    actionTags = actionTracingOptions.tags as (ctx: Context) => Record<string, unknown>;
  } else if (!actionTracingOptions.tags && isFunction(globalActionTags)) {
    actionTags = globalActionTags as (ctx: Context) => Record<string, unknown>;
  } else {
    actionTags = {
      data: globalTracingActionOptions?.data,
      ...((globalActionTags as Record<string, unknown>) || {}),
      ...((actionTracingOptions.tags as Record<string, unknown>) || {}),
    };
  }

  if (isObject(actionTags)) {
    const tagsObj = actionTags as Record<string, unknown>;
    if (tagsObj.data === true) {
      tags.data =
        context.data !== null && isObject(context.data)
          ? Object.assign({}, context.data)
          : context.data;
    } else if (Array.isArray(tagsObj.data)) {
      tags.data = (tagsObj.data as string[]).reduce<Record<string, unknown>>((acc, current) => {
        try {
          acc[current] = dotGet(context.data, current);
        } catch {
          const spanId = context.span ? context.span.id : undefined;

          context.service?.log.warn(
            {
              requestId: context.requestId,
              spanId,
            },
            `Unable to get value for tag "${current}" from data`,
          );
          acc[current] = undefined;
        }
        return acc;
      }, {});
    }

    if (tagsObj.meta === true) {
      tags.meta =
        context.meta !== null && isObject(context.meta)
          ? Object.assign({}, context.meta)
          : context.meta;
    } else if (Array.isArray(tagsObj.meta)) {
      tags.meta = (tagsObj.meta as string[]).reduce<Record<string, unknown>>((acc, current) => {
        try {
          acc[current] = dotGet(context.meta, current);
        } catch {
          const spanId = context.span ? context.span.id : undefined;

          context.service?.log.warn(
            {
              requestId: context.requestId,
              spanId,
            },
            `Unable to get value for tag "${current}" from metadata`,
          );
          acc[current] = undefined;
        }
        return acc;
      }, {});
    }
  } else if (isFunction(actionTags)) {
    tags.data = (actionTags as (ctx: Context) => Record<string, unknown>).call(
      context.service,
      context,
    );
  }
}

/**
 * Build span tags object for actions
 */
export const buildActionTags = (
  context: Context,
  globalTracingOptions: { actions?: TracingTagsOptions },
  actionTracingOptions: ActionTracingOptions,
): ActionTags => {
  const tags: ActionTags = {
    requestLevel: context.level,
    action: context.action
      ? { name: context.action.name, shortName: context.action.shortName }
      : null,
    isRemoteCall: !!context.callerNodeId,
    nodeId: context.nodeId,
    requestId: context.requestId,
  };

  try {
    addPreHandleTagsFromDefinition(
      context,
      tags,
      globalTracingOptions.actions,
      actionTracingOptions,
    );
  } catch (error) {
    const spanId = context.span ? context.span.id : undefined;

    context.service?.log.warn(
      {
        requestId: context.requestId,
        spanId,
      },
      `Error while building action tags: ${(error as Error).message}`,
    );
  }

  return tags;
};

/**
 * Build span tags object for events
 */
export const buildEventTags = (
  context: Context,
  globalTracingOptions: { events?: TracingTagsOptions },
  eventTracingOptions: EventTracingOptions,
): EventTags => {
  const tags: EventTags = {
    requestLevel: context.level,
    event: context.eventName,
    eventType: context.eventType,
    isRemoteCall: !!context.callerNodeId,
    nodeId: context.nodeId,
    requestId: context.requestId,
  };

  try {
    addPreHandleTagsFromDefinition(context, tags, globalTracingOptions.events, eventTracingOptions);
  } catch (error) {
    const spanId = context.span ? context.span.id : undefined;

    context.service?.log.warn(
      {
        requestId: context.requestId,
        spanId,
      },
      `Error while building event tags: ${(error as Error).message}`,
    );
  }

  return tags;
};

export const addResponseTags = (
  context: Context,
  tags: ResponseTags,
  result: unknown,
  globalTracingActionOptions: TracingTagsOptions | undefined,
  actionTracingOptions: ActionTracingOptions,
): void => {
  const globalActionTags = globalTracingActionOptions?.tags as Record<string, unknown> | undefined;
  const actionTags = {
    response: globalTracingActionOptions?.response,
    ...(globalActionTags || {}),
    ...((actionTracingOptions.tags as Record<string, unknown>) || {}),
  };

  if (actionTags.response === true) {
    tags.response = result !== null && isObject(result) ? Object.assign({}, result) : result;
  } else if (Array.isArray(actionTags.response)) {
    tags.response = (actionTags.response as string[]).reduce<Record<string, unknown>>(
      (acc, current) => {
        try {
          acc[current] = dotGet(result, current);
        } catch {
          const spanId = context.span ? context.span.id : undefined;

          context.service?.log.warn(
            {
              requestId: context.requestId,
              spanId,
            },
            `Unable to get response tag "${current}" from result`,
          );
          acc[current] = undefined;
        }
        return acc;
      },
      {},
    );
  }
};
