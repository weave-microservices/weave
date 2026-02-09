import { isFunction, uuid } from "@weave-js/utils";
import type { Runtime } from "../../types/index.js";

/**
 * Init uuid Generator and attach it to our runtime object.
 * @param runtime Runtime object.
 * @returns void
 */
export const initUUIDFactory = (runtime: Runtime): void => {
  const { options } = runtime;

  runtime.generateUUID =
    options.uuidFactory && isFunction(options.uuidFactory)
      ? () => options.uuidFactory!(runtime)
      : uuid;
};
