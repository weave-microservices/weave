/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2020 Fachwerk
 */
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'WeaveBroke... Remove this comment to see the full error message
const { WeaveBrokerOptionsError } = require('../../errors');
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'fromURI'.
const fromURI = require('./fromURI');
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'getAdapter... Remove this comment to see the full error message
const getAdapterByName = require('./getAdapterByName');
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'adapters'.
const adapters = require('./adapters');
const resolve = (broker, options) => {
    if (typeof options === 'object') {
        if (typeof options.adapter === 'string') {
            const Adapter = getAdapterByName(options.adapter);
            if (Adapter) {
                return Adapter(options.options);
            }
            else {
                // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
                broker.handleError(new WeaveBrokerOptionsError(`Invalid transport settings: ${options.adapter}`));
            }
        }
        return options.adapter;
    }
    //  else if (typeof options === 'string') {
    //     let Adapter = getAdapterByName(options)
    //     if (Adapter) {
    //         return Adapter()
    //     }
    //     if (options.startsWith('dummy://')) {
    //         Adapter = adapters.Dummy
    //     } else if (options.startsWith('redis://')) {
    //         Adapter = adapters.Redis
    //     } else if (options.startsWith('nats://')) {
    //         Adapter = adapters.NATS
    //     }
    //     if (Adapter) {
    //         return Adapter(options)
    //     } else {
    //         throw new WeaveBrokerOptionsError(`Invalid transport settings: ${options}`, { type: options })
    //     }
    // }
    return null;
};
module.exports = Object.assign({ resolve, fromURI }, adapters);
