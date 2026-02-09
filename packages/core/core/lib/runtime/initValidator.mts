/*
 * Author: Kevin Ries (kevin.ries@fachwerk.io)
 * -----
 * Copyright 2021 Fachwerk
 */

import ObjectValidator from "@weave-js/validator";
import type { Runtime } from "../../types/index.js";

/**
 * Init validator and attach it to our runtime object.
 * @param runtime Runtime object.
 */
export const initValidator = (runtime: Runtime): void => {
  const validator = ObjectValidator();

  Object.defineProperty(runtime, "validator", {
    value: {
      ...validator,
    },
  });
};
