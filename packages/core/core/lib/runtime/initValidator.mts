/*
 * Author: Kevin Ries (kevin.ries@fachwerk.io)
 * -----
 * Copyright 2021 Fachwerk
*/

import ObjectValidator from '@weave-js/validator';

/**
 * Init validator and attach it to our runtime object.
 * @param {import('../../types').Runtime} runtime Runtime object.
*/
export const initValidator = (runtime) => {
  const validator = ObjectValidator();

  Object.defineProperty(runtime, 'validator', {
    value: {
      ...validator
    }
  });
};
