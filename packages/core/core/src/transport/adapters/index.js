/*
 * Author: Kevin Ries (kevin.ries@fachwerk.io)
 * -----
 * Copyright 2021 Fachwerk
 */

const { WeaveBrokerOptionsError } = require('../../');
const fromURI = require('./fromURI');
const getAdapterByName = require('./getAdapterByName');
const adapters = require('./adapters');

const resolve = (broker, options) => {
  if (typeof options === 'object') {
    if (typeof options.adapter === 'string') {
      const Adapter = getAdapterByName(options.adapter);

      if (Adapter) {
        return Adapter(options.options);
      } else {
        broker.handleError(new WeaveBrokerOptionsError(`Invalid transport settings: ${options.adapter}`));
      }
    }
    return options.adapter;
  }

  return null;
};

module.exports = Object.assign({ resolve, fromURI }, adapters);
