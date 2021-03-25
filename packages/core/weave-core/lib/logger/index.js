/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2019 Fachwerk
 */

/** @module weave */

// npm modules
const path = require('path')
const util = require('util')

// 3rd party modules
const kleur = require('kleur')
const figures = require('figures')

// own modules
const defaultTypes = require('./types')
// const { isStreamObjectMode } = require('@weave-js/utils')
const { gray, underline, grey, dim } = kleur

// log levels
const LOG_LEVELS = [
  'trace',
  'debug',
  'info',
  'warn',
  'error',
  'fatal'
]

const arrayify = i => Array.isArray(i) ? i : [i]

const dummyLogMethod = () => {}

const mergeTypes = (standard, custom) => {
  const types = Object.assign({}, standard)

  Object.keys(custom).forEach(type => {
    types[type] = Object.assign({}, types[type], custom[type])
  })

  return types
}

const getLongestBadge = (options) => {
  const labels = Object.keys(options.types).map(x => options.types[x].badge)
  return labels.reduce((x, y) => x.length > y.length ? x : y)
}

const getLongestLabel = (options) => {
  const labels = Object.keys(options.types).map(x => options.types[x].label)
  return labels.reduce((x, y) => x.length > y.length ? x : y)
}

const getDate = () => {
  const date = new Date()
  return date.toISOString()
}

exports.createDefaultLogger = (options, bindings) => {
  const logMethods = {}
  const loggerOptions = Object.assign({}, options)

  loggerOptions.customTypes = Object.assign({}, loggerOptions.types)
  loggerOptions.types = mergeTypes(defaultTypes, loggerOptions.customTypes)

  // process log types
  Object.keys(loggerOptions.types).forEach(type => {
    const isActive = loggerOptions.enabled && (LOG_LEVELS.indexOf(loggerOptions.types[type].logLevel) >= LOG_LEVELS.indexOf(loggerOptions.logLevel))
    logMethods[type] = isActive ? logger.bind(this, type) : dummyLogMethod
  })

  // init transport streams
  loggerOptions.streams = arrayify(loggerOptions.streams)
  loggerOptions.streams = loggerOptions.streams.map(stream => {
    // todo: validate stream
    return stream({ loggerOptions })
  })

  const longestBadge = getLongestBadge(loggerOptions)
  const longestLabel = getLongestLabel(loggerOptions)

  const getModuleName = () => {
    let module
    if (bindings.service) {
      module = bindings.service.name
    } else if (bindings.moduleName) {
      module = bindings.moduleName
    }

    return `${bindings.nodeId}/${module}`
  }

  const getFilename = () => {
    const tempStackTrace = Error.prepareStackTrace

    Error.prepareStackTrace = (_, stack) => stack

    const { stack } = new Error()

    Error.prepareStackTrace = tempStackTrace

    const callers = stack.map(x => x.getFileName())
    const firstExternalFilePath = callers.find(x => x !== callers[0])

    return firstExternalFilePath ? path.basename(firstExternalFilePath) : 'anonymous'
  }

  const formatDate = () => `[${getDate()}]`

  const formatFilename = () => gray(`[${getFilename()}]`)

  const buildMeta = (rawMessages) => {
    const meta = []

    if (loggerOptions.displayTimestamp) {
      const timestamp = formatDate()
      rawMessages.timestamp = timestamp
      meta.push(timestamp)
    }

    if (meta.length !== 0) {
      meta.push(`${figures.pointerSmall}`)
      return meta.map(item => gray(item))
    }

    return meta
  }

  const formatMessage = args => util.formatWithOptions({ colors: true, compact: 1, breakLength: Infinity }, ...arrayify(args))

  const formatAdditional = ({ prefix, suffix }, args) => {
    return (suffix || prefix) ? '' : formatMessage(args)
  }

  const write = (stream, message) => {
    stream.write(message)
  }

  const buildMessageObject = (type, ...args) => {
    let [msg, additional] = [{}, {}]
    const logMessageObject = {}

    if (args.length === 1 && typeof args[0] === 'object' && args[0] !== null) {
      if (args[0] instanceof Error) {
        [msg] = args
      } else {
        const [{ prefix, message, suffix }] = args
        additional = Object.assign({}, { prefix, suffix })
        msg = message ? formatMessage(message) : formatAdditional(additional, args)
      }
    } else {
      logMessageObject.message = formatMessage(args)
    }

    const rawMessages = {}
    const messages = buildMeta(rawMessages)

    if (additional.prefix) {
      rawMessages.prefix = additional.prefix
      messages.push(additional.prefix)
    }

    if (loggerOptions.displayBadge && type.badge) {
      rawMessages.badge = type.badge
      messages.push(kleur[type.color](type.badge.padEnd(longestBadge.length + 1)))
    }

    if (msg instanceof Error && msg.stack) {
      const [name, ...rest] = msg.stack.split('\n')

      messages.push(name)
      messages.push(dim(grey(rest.map(l => l.replace(/^/, '\n')).join(''))))

      return messages.join(' ')
    }

    if (loggerOptions.displayLabel && type.label) {
      rawMessages.label = type.label
      messages.push(kleur[type.color](underline(type.label).padEnd(underline(longestLabel).length + 1)))
    }

    if (loggerOptions.displayModuleName) {
      const moduleName = getModuleName()
      rawMessages.moduleName = moduleName
      messages.push(gray(`[${moduleName}]`))
    }

    messages.push(msg)

    if (loggerOptions.displayFilename) {
      messages.push(formatFilename())
    }

    if (type.done) {
      type.done.call(null, msg, rawMessages)
    }

    return messages.join(' ')
    return logMessageObject
  }

  const log = (message, streams = loggerOptions.streams) => {
    arrayify(streams)
      .forEach(stream => write(stream, message))
  }

  function logger (typeName, ...messageObject) {
    const { stream, logLevel } = loggerOptions.types[typeName]
    const messageObject = buildMessageObject(loggerOptions.types[typeName], ...messageObject)

    return log(messageObject, stream, logLevel)
  }

  return logMethods
}
