/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2018 Fachwerk
 */

// npm packages
const { red, bgRed, yellow, magenta, gray, green, enabled } = require('kleur')
const util = require('util')

// default log levels
const LOG_LEVELS = ['fatal', 'error', 'warn', 'info', 'debug', 'trace']

exports.createDefaultLogger = (baseLogger, bindings, logLevel) => {
    // map colors to log levels
    const getColor = level => {
        switch (level) {
            case 'fatal': return bgRed
            case 'error': return red
            case 'warn': return yellow
            case 'debug': return magenta
            case 'trace': return gray
            default: return green
        }
    }

    const getFormatedLogLevel = level => getColor(level)(level.toUpperCase())

    const getModuleName = () => {
        let module
        if (bindings.service) {
            module = bindings.service.name.toUpperCase()
        } else if (bindings.logName) {
            module = bindings.logName.toUpperCase()
        }
        return `${bindings.nodeId}/${module}`
    }

    const logger = {}
    LOG_LEVELS.forEach((level, i) => {
        if (!baseLogger || (logLevel && i > LOG_LEVELS.indexOf(logLevel))) {
            logger[level] = () => {}
            return
        }

        const method = baseLogger[level] || baseLogger['info']
        const defaultLogObjectPrinter = o => util.inspect(o, { showHidden: false, depth: 2, colors: enabled, breakLength: Number.POSITIVE_INFINITY })

        logger[level] = function (...args) {
            const logArgs = args.map(arg => {
                if (typeof arg === 'object' || Array.isArray(arg)) {
                    return defaultLogObjectPrinter(arg)
                }
                return arg
            })
            method.call(baseLogger, gray(`[${new Date().toISOString()}]`), getFormatedLogLevel(level), gray(`${getModuleName()}:`), ...logArgs)
        }
    })
    return logger
}
