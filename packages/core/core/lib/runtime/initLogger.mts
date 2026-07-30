import { defaultsDeep } from "@weave-js/utils";
import { createLogger as createDefaultLogger } from "../logger/index.mts";
import type { Runtime, Logger, LoggerFactoryBindings, LoggerOptions } from "../../types/index.js";

const DEFAULT_LOGGER_NAME = "WEAVE";

export const initLogger = (runtime: Runtime): void => {
  /**
   * Factory function to create module-specific loggers
   * @param moduleName - Name of the module requesting a logger
   * @param additional - Additional metadata to include in log entries
   * @returns Configured logger instance
   */
  const loggerFactory = (moduleName: string, additional: Record<string, unknown> = {}): Logger => {
    const bindings: LoggerFactoryBindings = {
      nodeId: runtime.options.nodeId ?? "",
      moduleName,
      ...additional,
    };

    if (typeof runtime.options.logger === "function") {
      return runtime.options.logger(bindings);
    }

    const loggerOptions: LoggerOptions = defaultsDeep(
      {
        base: {
          ...bindings,
        },
      },
      runtime.options.logger,
    );

    return createDefaultLogger(loggerOptions);
  };

  const createLogger = (moduleName: string, service?: Record<string, unknown>): Logger =>
    loggerFactory(moduleName, service);

  /**
   * Main runtime logger instance
   */
  const log: Logger = createLogger(DEFAULT_LOGGER_NAME);

  Object.assign(runtime, {
    createLogger,
    log,
  });
};
