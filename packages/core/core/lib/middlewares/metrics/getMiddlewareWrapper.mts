import { Constants } from "../../metrics/index.mts";
import type { ActionHandler, Context, Runtime, ServiceInjection, ParsedAction } from "../../../types/index.js";

type ActionType = "local" | "remote";

type MiddlewareWrapperFunction = (type: ActionType, action: ParsedAction, handler: ActionHandler) => ActionHandler;

export const getMiddlewareWrapper = (runtime: Runtime): MiddlewareWrapperFunction =>
  function (type: ActionType, action: ParsedAction, handler: ActionHandler): ActionHandler {
    const serviceName = action.service ? action.service.fullyQualifiedName : null;
    const actionName = action.name;

    return function metricMiddleware(context: Context, serviceInjections: ServiceInjection): Promise<any> {
      const callerNodeId = context.callerNodeId;

      runtime.metrics!.increment(Constants.REQUESTS_TOTAL, {
        type,
        serviceName,
        actionName,
        callerNodeId,
      });
      runtime.metrics!.increment(Constants.REQUESTS_IN_FLIGHT, {
        type,
        serviceName,
        actionName,
        callerNodeId,
      });
      const requestEnd = runtime.metrics!.timer(Constants.REQUESTS_TIME, {
        type,
        serviceName,
        actionName,
        callerNodeId,
      });

      return handler(context, serviceInjections)
        .then((result: unknown) => {
          requestEnd();
          runtime.metrics!.decrement(Constants.REQUESTS_IN_FLIGHT, {
            type,
            serviceName,
            actionName,
            callerNodeId,
          });
          return result;
        })
        .catch((error: Error) => {
          requestEnd();
          runtime.metrics!.decrement(Constants.REQUESTS_IN_FLIGHT, {
            type,
            serviceName,
            actionName,
            callerNodeId,
          });
          runtime.metrics!.increment(Constants.REQUESTS_ERRORS_TOTAL);
          runtime.handleError(error);
        });
    };
  };
