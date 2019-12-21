/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2019 Fachwerk
 */

module.exports = {
    BaseAdapter: require('./adapter-base'),
    Redis: require('./redis'),
    NATS: require('./nats'),
    Dummy: require('./dummy'),
    TCP: require('./tcp')
}