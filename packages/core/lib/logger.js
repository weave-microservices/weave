/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2018 Fachwerk
 */

'use strict'

const chalk = require('chalk')
const util = require('util')

const LOG_LEVELS = ['fatal', 'error', 'warn', 'info', 'debug', 'trace']

module.exports = {
    createDefaultLogger (baseLogger, bindings, logLevel) {
        const getColor = level => {
            switch (level) {
                case 'fatal': return chalk.red.inverse
                case 'error': return chalk.red
                case 'warn': return chalk.yellow
                case 'debug': return chalk.magenta
                case 'trace': return chalk.gray
                default: return chalk.green
            }
        }

        const getLogLevelFormated = level => getColor(level)(level.padEnd(10))

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
            const defaultLogObjectPrinter = o => util.inspect(o, { showHidden: false, depth: 2, colors: chalk.enabled, breakLength: Number.POSITIVE_INFINITY })

            logger[level] = function (...args) {
                const logArgs = args.map(arg => {
                    if (typeof arg === 'object' || Array.isArray(arg)) {
                        return defaultLogObjectPrinter(arg)
                    }
                    return arg
                })
                method.call(baseLogger, chalk.grey(`[${new Date().toISOString()}]`), getLogLevelFormated(level), chalk.grey(`${getModuleName()}:`), ...logArgs)
            }
        })
        return logger
    }
}
