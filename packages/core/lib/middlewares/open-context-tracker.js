/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2018 Fachwerk
 */

module.exports = () => {
    return {
        created (broker) {
            broker.log.info('')
        }
    }
}
