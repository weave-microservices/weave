/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2018 Fachwerk
 */

/** @module weave */

// npm packages
const kleur = require('kleur')
const util = require('util')
const figures = require('figures')
// own packages
const defaultTypes = require('./types')

// extract colors
const { gray, underline } = kleur

// default log levels
const LOG_LEVELS = ['fatal', 'error', 'warn', 'info', 'debug', 'trace']

/**
 * Configuration object for weave service broker.
 * @typedef {Object} Logger
 * @property {string} nodeId - Name of the Service broker node.
 * @property {string|Object} codec - Codec for data serialization.
 * @property {boolean} hasPower - Indicates whether the Power component is present.
 * @property {boolean} hasWisdom - Indicates whether the Wisdom component is present.
 */

module.exports.createDefaultLogger = (options, bindings, globalLogLevel) => {
    const logMethods = {}

    options.customTypes = Object.assign({}, options.types)
    options.types = mergeTypes(defaultTypes, options.customTypes)
    // options = Object.assign(defaultOptions, options)

    const longestBadge = getLongestBadge()
    const longestLabel = getLongestLabel()

    Object.keys(options.types).forEach(type => {
        logMethods[type] = logger.bind(this, type)
    })

    function mergeTypes (standard, custom) {
        const types = Object.assign({}, standard)

        Object.keys(custom).forEach(type => {
            types[type] = Object.assign({}, types[type], custom[type])
        })

        return types
    }

    const getModuleName = () => {
        let module
        if (bindings.service) {
            module = bindings.service.name
        } else if (bindings.logName) {
            module = bindings.logName
        }
        return `${bindings.nodeId}/${module}`
    }

    function getLongestBadge () {
        const labels = Object.keys(options.types).map(x => options.types[x].badge)
        return labels.reduce((x, y) => x.length > y.length ? x : y)
    }

    function getLongestLabel () {
        const labels = Object.keys(options.types).map(x => options.types[x].label)
        return labels.reduce((x, y) => x.length > y.length ? x : y)
    }

    const getDate = () => {
        const date = new Date()
        return date.toISOString()
    }

    const formatDate = () => `[${getDate()}]`

    const arrayify = i => Array.isArray(i) ? i : [i]

    const formatStream = stream => arrayify(stream)

    const buildMeta = () => {
        const meta = []

        if (options.showTimestamp) {
            meta.push(formatDate())
        }

        if (options.showModuleName) {
            const moduleName = getModuleName()
            meta.push(`[${moduleName}]`)
        }

        if (meta.length !== 0) {
            meta.push(`${figures.pointerSmall}`)
            return meta.map(item => gray(item))
        }

        return meta
    }

    const formatMessage = args => util.format(...arrayify(args))

    const formatAdditional = additional => {
        return ''
    }

    const write = (stream, message) => {
        stream.write(message + '\n')
    }

    const dummyLog = () => {}

    const buildMessage = (type, ...args) => {
        let [msg, additional] = [{}, {}]
        if (args.length === 1 && typeof args[0] === 'object' && args[0] !== null) {
            if (args[0] instanceof Error) {
                [msg] = args
            } else {
                const [{ prefix, message, suffix }] = args
                additional = Object.assign({}, { prefix, suffix })
                msg = message ? formatMessage(message) : formatAdditional(additional)
            }
        } else {
            msg = formatMessage(args)
        }

        const messages = buildMeta()

        if (additional.prefix) {
            messages.push(additional.prefix)
        }

        if (options.showBadge && type.badge) {
            messages.push(kleur[type.color](type.badge.padEnd(longestBadge.length + 1)))
        }

        if (options.showLabel && type.label) {
            messages.push(kleur[type.color](underline(type.label).padEnd(underline(longestLabel).length + 1)))
        }

        messages.push(msg)

        return messages.join(' ')
    }

    const log = (message, streams = options.stream, typeLogLevel) => {
        formatStream(streams)
            .forEach(stream => write(stream, message))
    }

    function logger (type, ...messageObject) {
        if (!options.enabled || !globalLogLevel || LOG_LEVELS.indexOf(options.types[type].logLevel) > LOG_LEVELS.indexOf(globalLogLevel)) {
            return dummyLog
        }
        const { stream, logLevel, done } = options.types[type]
        const message = buildMessage(options.types[type], ...messageObject)
        if (done) {
            done(...messageObject)
        }
        return log(message, stream, logLevel)
    }

    return logMethods
}
