/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2018 Fachwerk
 */

const useFactory = ({ state }) =>
    middleware => {
        if (typeof middleware === 'function') {
            state.middlewares.push(middleware)
        }
    }

module.exports = useFactory
