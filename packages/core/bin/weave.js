#!/usr/bin/env node

// npm packages
const fs = require('fs')
const path = require('path')
const _ = require('lodash')
const isPlainObject = require('../lib/utils/is-plain-object')
const Args = require('args')

// own packages
const { Weave, defaultOptions, Errors } = require('../lib')
const { WeaveError } = Errors

// Default name for config files
const defaultConfigFileName = 'weave.config.js'

let flags
let configFile
let config
let servicePaths
let node

const processFlags = () => {
  Args
    .option('config', 'Load the configuration from a file')
    .option('silent', 'Silent mode. No logger', false)
    .option('repl', 'Start REPL mode', false)
    .option('watch', 'Hot reload services if changed', false)

  flags = Args.parse(process.argv, {
    mri: {
      alias: {
        c: 'config',
        s: 'silent',
        r: 'repl',
        w: 'watch'
      },
      boolean: ['repl', 'silent', 'watch'],
      string: ['config']
    }
  })
  servicePaths = Args.sub
}

/**
 * Load config file
 * @returns {void}
 */
const loadConfigFile = () => {
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
      return Promise.reject(new WeaveError(`Config file not found: ${filePath}`))
    }

    const fileExtension = path.extname(filePath)

    // check file extension
    switch (fileExtension) {
    case '.json':
    case '.js': {
      configFile = require(filePath)
      break
    }
    default:
      return Promise.reject(new WeaveError(`Not supported file extension: ${fileExtension}`))
    }
  }
}

const mergeOptions = () => {
  config = _.defaultsDeep(configFile, defaultOptions)
  // if (config.logger == null && !flags.silent) {
  //     config.logger = console
  // }

  const overwriteFromEnv = (obj, prefix) => {
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

      if (isPlainObject(obj[key])) {
        obj[key] = overwriteFromEnv(obj[key], key)
      }
    })
    return obj
  }

  config = overwriteFromEnv(config)

  if (flags.silent) {
    config.logger.enabled = false
  }

  if (flags.watch) {
    config.watchServices = true
  }
}

const loadServices = () => {
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
          throw new WeaveError(`Path not found: ${svcPath}`)
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

    // Services to be loaded are passed as string
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
            throw new WeaveError(`Path not found: ${svcPath}`)
          }

          node.loadService(svcPath)
        }
      })
    }
  }
}

/**
 * Load service from NPM module
 * @param {String} fileName File name
 * @returns {Service} Service
 */
const loadNpmModule = (fileName) => {
  const schema = require(fileName)
  return node.createService(schema)
}

/**
 * Start weave broker
 * @returns {Promise} Promise
 */
const startBroker = () => {
  node = Weave(config)
  loadServices()
  node.start()
    .then(() => {
      if (flags.repl) {
        let repl
        try {
          repl = require('@weave-js/repl')
        } catch (error) {
          node.log.error('To use REPL with weave, you have to install the REPL package with the command \'npm install @weave-js/repl\'.')
          return
        }

        if (repl) {
          return repl(node)
        }
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
