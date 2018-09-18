#!/usr/bin/env node

const { Weave, Errors } = require('../lib')
const fs = require('fs')
const path = require('path')
const _ = require('lodash')
const Args = require('args')

const defaultConfigFileName = 'weave.config.js'

let flags
let configFile
let config
let servicePaths
let node

/**
 * Process command line arguments
 *
 * Available options:
 * 		-c, --config <file> - Load an external configuration files (.js or .json)
 * 		-r, --repl  		- After broker started, switch to REPL mode
 * 		-s , --silent 		- Silent mode. Disable logger, no console messages.
 */

function processFlags () {
    Args
        .option('config', 'Load the configuration from a file')
        .option('repl', 'Start REPL mode', false)
        .option('watch', 'Hot reload services if changed', false)
        .option('silent', 'Silent mode. No logger', false)

    flags = Args.parse(process.argv, {
        mri: {
            alias: {
                c: 'config',
                r: 'repl',
                w: 'watch',
                s: 'silent'
            },
            boolean: ['repl', 'silent', 'watch'],
            string: ['config']
        }
    })

    servicePaths = Args.sub
}

function loadConfigFile () {
    let filePath
    if (flags.config) {
        filePath = path.isAbsolute(flags.config) ? flags.config : path.resolve(process.cwd(), flags.config)
    }
    if (!filePath && fs.existsSync(path.resolve(process.cwd(), defaultConfigFileName))) {
        filePath = path.resolve(process.cwd(), defaultConfigFileName)
    }
    if (!filePath && fs.existsSync(path.resolve(process.cwd(), defaultConfigFileName))) {
        filePath = path.resolve(process.cwd(), defaultConfigFileName)
    }

    if (filePath) {
        if (!fs.existsSync(filePath)) {
            return Promise.reject(new Errors.WeaveError(`Config file not found: ${filePath}`))
        }

        const ext = path.extname(filePath)

        switch (ext) {
            case '.json':
            case '.js': {
                configFile = require(filePath)
                break
            }
            default: return Promise.reject(new Errors.WeaveError(`Not supported file extension: ${ext}`))
        }
    }
}

function mergeOptions () {
    config = _.defaultsDeep(configFile, Weave.defaultOptions)
    if (config.logger == null && !flags.silent) {
        config.logger = console
    }

    function overwriteFromEnv (obj, prefix) {
        Object.keys(obj).forEach(key => {
            const envName = ((prefix ? prefix + '_' : '') + key).toUpperCase()

            if (process.env[envName]) {
                let v = process.env[envName]

                if (v.toLowerCase() === 'true' || v.toLowerCase() === 'false') {
                    // Convert to boolean
                    v = v === 'true'
                } else if (!isNaN(v)) {
                    // Convert to number
                    v = Number(v)
                }
                obj[key] = v
            }

            if (_.isPlainObject(obj[key])) {
                obj[key] = overwriteFromEnv(obj[key], key)
            }
        })
        return obj
    }

    config = overwriteFromEnv(config)

    if (flags.silent) {
        config.logger = null
    }

    if (flags.watch) {
        config.watchServices = true
    }
}

function loadServices () {
    if (servicePaths.length > 0) {
        servicePaths.forEach(p => {
            if (!p) return
            if (p.startsWith('npm:')) {
                // Load from NPM module
                loadNpmModule(p.slice(4))
            } else {
                // Load file or dir
                const svcPath = path.isAbsolute(p) ? p : path.resolve(process.cwd(), p)
                if (!fs.existsSync(svcPath)) {
                    throw new Errors.WeaveError(`Path not found: ${svcPath}`)
                }

                const isDir = fs.lstatSync(svcPath).isDirectory()
                if (isDir) {
                    node.loadServices(svcPath)
                } else {
                    node.loadService(svcPath)
                }
            }
        })
    } else if (process.env.SERVICES || process.env.SERVICEDIR) {
        const svcDir = process.env.SERVICEDIR || ''
        if (fs.existsSync(svcDir) && !process.env.SERVICES) {
            // Load all services from directory
            node.loadServices(path.isAbsolute(svcDir) ? svcDir : path.resolve(process.cwd(), svcDir))
        }

        if (process.env.SERVICES) {
            const services = Array.isArray(process.env.SERVICES) ? process.env.SERVICES : process.env.SERVICES.split(',')
            const dir = path.isAbsolute(svcDir) ? svcDir : path.resolve(process.cwd(), svcDir || '')

            services.map(s => s.trim()).forEach(p => {
                let name = p
                if (name.startsWith('npm:')) {
                    // Load from NPM module
                    loadNpmModule(p.slice(4))
                } else {
                    // Load from local files
                    if (!name.endsWith('.service.js') && !name.endsWith('.js')) {
                        name = name + '.service.js'
                    }

                    const svcPath = path.resolve(dir, name)
                    if (!fs.existsSync(svcPath)) {
                        throw new Errors.WeaveError(`Path not found: ${svcPath}`)
                    }

                    node.loadService(svcPath)
                }
            })
        }
    }
}

/**
 * Load service from NPM module
 *
 * @param {String} name
 * @returns {Service}
 */

function loadNpmModule (name) {
    const svc = require(name)
    return node.createService(svc)
}

/**
 * Start Weave node
 */

function startBroker () {
    node = Weave(config)

    loadServices()

    node.start()
        .then(() => {
            if (flags.repl) {
                node.repl()
            }
        })
}

Promise.resolve()
    .then(processFlags)
    .then(loadConfigFile)
    .then(mergeOptions)
    .then(startBroker)
    .catch(err => {
        console.error(err)
        process.exit(1)
    })
