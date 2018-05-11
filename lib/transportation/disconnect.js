/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2018 Fachwerk
 */

const connectFactory = ({ transport }) =>
    () => {
        return transport.close()
    }

module.exports = connectFactory
