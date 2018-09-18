/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2018 Fachwerk
 */
'use strict'

const useFactory = ({ state }) =>
    middleware => {
        if (typeof middleware === 'function') {
            state.middlewares.push(middleware)
        }
    }

module.exports = useFactory
