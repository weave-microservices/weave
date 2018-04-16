/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2018 Fachwerk
 */

const replFactory = ({ state, log, call, start, stop, registry, statistics }) =>
    () => {
        let repl

        try {
            repl = require('weave-repl')
        } catch (error) {
            console.log(error)
            log.error(`To use REPL with state, you have to install the REPL package with the command 'npm install weave-repl'`)
            return
        }

        if (repl) {
            repl({ state, call, start, stop, registry, statistics })
        }
    }

module.exports = replFactory
