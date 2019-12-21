/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2019 Fachwerk
 */
const { parse } = require('url')
const assert = require('assert')
const getAdapterByName = require('./getAdapterByName')

function fromURI (uri) {
    assert(typeof uri === 'string', 'Fehler')

    const urlObject = parse(uri)

    assert(urlObject.protocol, 'Protocol is missing.')

    const name = urlObject.protocol.slice(0, -1).toLowerCase()

    const AdapterFactory = getAdapterByName(name)
    let config = null
    if (AdapterFactory.uriToConfig) {
        config = AdapterFactory.uriToConfig(urlObject)
    }
    return AdapterFactory(config)
}

module.exports = fromURI