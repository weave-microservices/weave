/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2018 Fachwerk
 */

const actionWrapperFactory = ({ state }) =>
    /**
     * Wrapps an action into the middlewares.
     * @param {any} action
     * @returns <action>
     */
    action => {
        let handler = action.handler
        if (state.middlewares.length) {
            handler = state.middlewares.reduce((handler, middleware) => {
                return middleware(handler, action)
            }, handler)
        }
        action.handler = handler
        return action
    }

module.exports = actionWrapperFactory
