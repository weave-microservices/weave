const path = require('path')
const fs = require('fs')
const cliUI = require('../utils/cli-ui')
const convertArgs = require('../utils/convert-args')
const { safeCopy, isStream, isObject, timespanFromUnixTimes } = require('@weave-js/utils')

const util = require('util')

function handleResult (result, args, startTime) {
  const endTime = process.hrtime(startTime)
  // Save response
  if (args.options.s) {
    const resultIsStream = isStream(result)
    let filePath

    if (typeof args.options.s === 'string') {
      filePath = path.resolve(args.options.s)
    } else {
      filePath = path.resolve(`${args.actionName}.response`)

      if (resultIsStream) {
        filePath += '.stream'
      } else {
        filePath += isObject(result) ? '.json' : '.txt'
      }
    }

    if (resultIsStream) {
      const ws = fs.createWriteStream(filePath)
      result.pipe(ws)
    } else {
      const data = isObject(result) ? JSON.stringify(safeCopy(result), null, 2) : result
      fs.writeFileSync(filePath, data, { encoding: 'utf8', flag: 'w' })
    }
  }
  const duration = (endTime[0] + endTime[1] / 1e9) * 1000

  console.log(cliUI.warningText(`>> Response (${timespanFromUnixTimes(duration)}):`))
  console.log(util.inspect(result, {
    showHidden: false,
    depth: 4,
    colors: true
  }))
}

function handleError (error) {
  const [name, ...rest] = error.stack.split('\n')

  console.log(cliUI.errorText('>> ERROR:', error.message))
  console.log(cliUI.text(name))
  console.log(cliUI.neutralText(rest.map(l => l.replace(/^/, '\n')).join('')))
  console.log('Data: ', util.inspect(error.data, {
    showHidden: false,
    depth: 4,
    colors: true
  }))
}

/**
 * Prepare request options
 * @param {*} args Params
 * @returns {object} Options
*/
function prepareOptions (args) {
  const options = {
    meta: {
      $repl: true
    }
  }

  if (args.nodeId) {
    options.nodeId = args.nodeId
  }

  return options
}

function preparePayloadArguments (args, payload, done) {
  if (typeof args.jsonParams === 'string') {
    try {
      return JSON.parse(args.jsonParams)
    } catch (error) {
      console.log(error.message)
      done()
    }
  } else {
    const options = convertArgs(args.options)

    // Remove save parameter from params
    if (args.options.s) {
      delete options.s
    }

    Object.keys(options).map(key => {
      payload[key] = options[key]
    })

    return payload
  }
}

/**
 * Send payload from file as object.
 * @param {*} args Params
 * @returns {void}
 */
function preparePayloadFromFile (args) {
  let filePath

  if (typeof args.options.f === 'string') {
    filePath = path.resolve(args.options.f)
  } else {
    filePath = path.resolve(`${args.actionName}.data.json`)
  }

  if (fs.existsSync(filePath)) {
    try {
      console.log(cliUI.infoText(`Read payload from ${filePath}`))
      return JSON.parse(fs.readFileSync(filePath, 'utf8'))
    } catch (error) {
      console.log(cliUI.errorText('Can\'t parse parameter file'), error)
    }
  } else {
    console.log(cliUI.errorText(`File not found: ${filePath}`))
  }
}

function preparePayloadStream (args) {
  let filePath

  if (typeof args.options.stream === 'string') {
    filePath = path.resolve(args.options.stream)
  } else {
    filePath = path.resolve(`${args.actionName}.file`)
  }

  if (fs.existsSync(filePath)) {
    console.log(cliUI.infoText(`Send stream from ${filePath}`))
    return fs.createReadStream(filePath)
  } else {
    console.log(cliUI.errorText(`File not found: ${filePath}`))
  }
}

module.exports = (broker) =>
  (args, done) => {
    const callOptions = prepareOptions(args)
    // try to get data from arguments
    let payload = preparePayloadArguments(args, {}, done)

    // Send parameters from file
    if (args.options.f) {
      payload = preparePayloadFromFile(args) || payload
    }

    // Prepare send file stream
    if (args.options.stream) {
      callOptions.stream = preparePayloadStream(args, payload) || payload
    }

    console.log(cliUI.infoText(`>> Call "${args.actionName}" with data:`), payload)

    // Save the start time.
    const startTime = process.hrtime()

    broker.call(args.actionName, payload, callOptions)
      .then(result => handleResult(result, args, startTime))
      .catch(error => handleError(error))
      .finally(done)
  }
