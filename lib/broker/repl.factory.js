const replFactory = ({ state, log, call, start, stop, registry }) =>
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
            repl({ state, call, start, stop, registry })
        }
    }

module.exports = replFactory
