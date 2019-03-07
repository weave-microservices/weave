/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2018 Fachwerk
 */

const replFactory = (deps) =>
    () => {
        let repl

        try {
            repl = require('@weave-js/repl')
        } catch (error) {
            deps.log.error(`To use REPL with weave, you have to install the REPL package with the command 'npm install @weave-js/repl'.`)
            return
        }

        if (repl) {
            repl(deps)
        }
    }

module.exports = replFactory
