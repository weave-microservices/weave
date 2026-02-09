/*
 * Author: Kevin Ries (kevin.ries@fachwerk.io)
 * -----
 * Copyright 2021 Fachwerk
 */

import { WeaveParameterValidationError } from "../../errors.mts";
import { capitalize } from "@weave-js/utils";
import type {
  ActionHandler,
  Context,
  EventHandler,
  Middleware,
  Runtime,
  ServiceInjection,
  WeaveAction,
  WeaveEvent,
} from "../../../types/index.js";
import type { ValidationError, ValidationFunction, ValidationOptions } from "@weave-js/validator";

export default (runtime: Runtime): Middleware => {
  const validator = runtime.validator;

  const processErrors = (context: Context, type: string, results: ValidationError[]): Promise<never> => {
    const errors = results.map((data) =>
      Object.assign(data, { nodeId: context.nodeId, action: context.action?.name }),
    );
    return Promise.reject(
      new WeaveParameterValidationError(`${capitalize(type)} parameter validation error`, errors),
    );
  };

  return {
    localAction(handler: ActionHandler, action: WeaveAction): ActionHandler {
      const parameterOptions: ValidationOptions = Object.assign(
        {},
        runtime.options.validatorOptions,
        action.validatorOptions,
      );

      // validate request schema
      let validateRequestSchema: ValidationFunction | undefined;
      let validateResponseSchema: ValidationFunction | undefined;

      if (action.params && typeof action.params === "object") {
        validateRequestSchema = validator.compile(action.params, parameterOptions);
      }

      if (action.responseSchema && typeof action.responseSchema === "object") {
        validateResponseSchema = validator.compile(action.responseSchema, parameterOptions);
      }

      if (!validateRequestSchema && !validateResponseSchema) {
        return handler;
      }

      return (context: Context, serviceInjections: ServiceInjection): Promise<unknown> => {
        const requestSchemaResult = validateRequestSchema
          ? validateRequestSchema(context.data)
          : true;

        if (requestSchemaResult === true) {
          return handler(context, serviceInjections).then((result: unknown) => {
            if (validateResponseSchema) {
              const responseSchemaResult = validateResponseSchema(result);
              if (responseSchemaResult === true) {
                return result;
              }
              return processErrors(context, "response", responseSchemaResult);
            }
            return result;
          });
        } else {
          // Enriching the validator errors with some useful information
          return processErrors(context, "request", requestSchemaResult);
        }
      };
    },
    localEvent(handler: EventHandler, event: WeaveEvent): EventHandler {
      if (event.params && typeof event.params === "object") {
        const parameterOptions: ValidationOptions = Object.assign(
          {},
          runtime.options.validatorOptions,
          event.validatorOptions,
        );

        const validate: ValidationFunction = validator.compile(event.params, parameterOptions);

        return (context: Context, serviceInjections: ServiceInjection): Promise<unknown> => {
          const result = validate(context.data);

          if (result === true) {
            return handler(context, serviceInjections);
          } else {
            const errors = result.map((data: ValidationError) =>
              Object.assign(data, { nodeId: context.nodeId, event: context.eventName }),
            );
            return Promise.reject(
              new WeaveParameterValidationError("Parameter validation error", errors),
            );
          }
        };
      }
      return handler;
    },
  };
};
