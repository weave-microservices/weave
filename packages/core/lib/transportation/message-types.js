/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2018 Fachwerk
 */

const MESSAGE_UNKNOWN = 'unknown'
const MESSAGE_DISCOVERY = 'discovery'
const MESSAGE_INFO = 'info'
const MESSAGE_REQUEST = 'request'
const MESSAGE_RESPONSE = 'response'
const MESSAGE_RESPONSE_STREAM_CHUNK = 'response_stream_chunk'
const MESSAGE_RESPONSE_STREAM_END = 'response_stream_end'
const MESSAGE_DISCONNECT = 'disconnect'
const MESSAGE_HEARTBEAT = 'heartbeat'
const MESSAGE_EVENT = 'event'

module.exports = {
    MESSAGE_UNKNOWN,
    MESSAGE_DISCOVERY,
    MESSAGE_INFO,
    MESSAGE_REQUEST,
    MESSAGE_RESPONSE,
    MESSAGE_RESPONSE_STREAM_CHUNK,
    MESSAGE_RESPONSE_STREAM_END,
    MESSAGE_DISCONNECT,
    MESSAGE_HEARTBEAT,
    MESSAGE_EVENT
}