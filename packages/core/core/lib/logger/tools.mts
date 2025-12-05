import { format } from "./utils/format.mts";

export const noop = () => {};

export const generateLogMethod = (runtime: any, level: any, hook: any) => {
  if (!hook) {
    return log;
  }

  return function hookWrappedLog(...args: any[]) {
    hook.call(runtime, args, log, level);
  };

  function log(message: any, meta: any) {
    // If message is a string and meta is provided
    if (typeof message === "string") {
      if (meta && typeof meta === "object") {
        // New signature: log.info("message", { meta })
        runtime.write(meta, message, level);
      } else if (meta && typeof meta === "string") {
        // Legacy support: log.info("message", "extra string")
        runtime.write(null, format(message, [meta], runtime.options.formatOptions), level);
      } else {
        // Just a message: log.info("message")
        runtime.write(null, message, level);
      }
    } else if (typeof message === "object" && message !== null) {
      // Legacy support: log.info({ error }, "message")
      if (meta && typeof meta === "string") {
        runtime.write(message, meta, level);
      } else {
        // Just an object: log.info({ data })
        runtime.write(message, "", level);
      }
    } else {
      // Fallback
      runtime.write(null, String(message), level);
    }
  }
};

export const coreFixtures = (object: any) => {
  return object;
};
