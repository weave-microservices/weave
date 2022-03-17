/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2019 Fachwerk
 */
const { parse } = require('url');
const getAdapterByName = require('./getAdapterByName');

function fromURI (uri) {
  if (typeof uri !== 'string') {
    throw new Error('URI needs to be a string.');
  }

  const urlObject = parse(uri);

  if (!urlObject.protocol) {
    throw new Error('Protocol is missing.');
  }

  const name = urlObject.protocol.slice(0, -1).toLowerCase();

  const AdapterFactory = getAdapterByName(name);

  if (!AdapterFactory) {
    throw new Error('No adapter found.');
  }

  let config = null;
  if (AdapterFactory.uriToConfig) {
    config = AdapterFactory.uriToConfig(urlObject);
  }
  return AdapterFactory(config);
}

module.exports = fromURI;
