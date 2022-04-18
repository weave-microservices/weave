/*
 * Author: Kevin Ries (kevin.ries@fachwerk.io)
 * -----
 * Copyright 2021 Fachwerk
*/

const ObjectValidator = require('@weave-js/validator');

/**
 * Init validator and attach it to our runtime object.
 * @param {Runtime} runtime Runtime object.
 * @returns {void}
*/
exports.initValidator = (runtime) => {
  const validator = ObjectValidator();

  Object.defineProperty(runtime, 'validator', {
    value: {
      ...validator
    }
  });
};
