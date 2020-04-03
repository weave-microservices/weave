/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2020 Fachwerk
 */

const MESSAGE_UNKNOWN = 'unknown'
const MESSAGE_DISCOVERY = 'discovery'
const MESSAGE_INFO = 'info'
const MESSAGE_REQUEST = 'request'
const MESSAGE_RESPONSE = 'response'
const MESSAGE_RESPONSE_STREAM_CHUNK = 'response_stream_chunk'
const MESSAGE_RESPONSE_STREAM_END = 'response_stream_end'
const MESSAGE_PING = 'ping'
const MESSAGE_PONG = 'pong'
const MESSAGE_DISCONNECT = 'disconnect'
const MESSAGE_HEARTBEAT = 'heartbeat'
const MESSAGE_EVENT = 'event'
const MESSAGE_GOSSIP_REQUEST = 'gossip_request'
const MESSAGE_GOSSIP_RESPONSE = 'gossip_response'
const MESSAGE_GOSSIP_HELLO = 'gossip_hello'

const messageTypes = {
  MESSAGE_UNKNOWN,
  MESSAGE_DISCOVERY,
  MESSAGE_INFO,
  MESSAGE_REQUEST,
  MESSAGE_RESPONSE,
  MESSAGE_RESPONSE_STREAM_CHUNK,
  MESSAGE_RESPONSE_STREAM_END,
  MESSAGE_PING,
  MESSAGE_PONG,
  MESSAGE_DISCONNECT,
  MESSAGE_HEARTBEAT,
  MESSAGE_EVENT,
  MESSAGE_GOSSIP_HELLO,
  MESSAGE_GOSSIP_RESPONSE,
  MESSAGE_GOSSIP_REQUEST
}

module.exports = messageTypes
