const path = require('path')
const fs = require('fs')
const cliUI = require('../utils/cli-ui')
const convertArgs = require('../utils/convert-args')
const isStream = require('../utils/is-stream')
const isObject = require('../utils/is-object')
const removeCircularReferences = require('../utils/remove-circular-references')

const util = require('util')

function handleResult (result, args) {
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
      fs.createWriteStream(filePath).pipe(result)
    } else {
      const data = isObject(result) ? JSON.stringify(removeCircularReferences(result), null, 2) : result
      fs.writeFileSync(filePath, data, 'utf8')
    }
  }

  console.log(cliUI.warningText('>> Response:'))
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

module.exports = (broker) =>
  (args, done) => {
    const callOptions = {
      meta: {
        $repl: true
      },
      nodeId: args.nodeId
    }

    let payload

    if (typeof (args.jsonParams) === 'string') {
      try {
        payload = JSON.parse(args.jsonParams)
      } catch (error) {
        console.log(error.message)
        done()
      }
    } else {
      payload = {}
      const options = convertArgs(args.options)

      // Remove save parameter from params
      if (args.options.s) {
        delete options.s
      }

      Object.keys(options).map(key => {
        payload[key] = options[key]
      })
    }

    // Send parameters from file
    if (args.options.f) {
      let filePath

      if (typeof args.options.f === 'string') {
        filePath = path.resolve(args.options.f)
      } else {
        filePath = path.resolve(`${args.actionName}.params.json`)
      }

      if (fs.existsSync(filePath)) {
        try {
          payload = JSON.parse(fs.readFileSync(filePath, 'utf8'))
        } catch (error) {
          console.log(cliUI.errorText('Can\'t parse parameter file'), error)
        }
      } else {
        console.log(cliUI.errorText(`File not found: ${filePath}`))
      }
    }

    if (args.options.stream) {
      let filePath

      if (typeof args.options.stream === 'string') {
        filePath = path.resolve(args.options.stream)
      } else {
        filePath = path.resolve(`${args.actionName}.file`)
      }

      if (fs.existsSync(filePath)) {
        console.log(cliUI.infoText(`Send stream from ${filePath}`))
        payload = fs.createReadStream(filePath)
      } else {
        console.log(cliUI.errorText(`File not found: ${filePath}`))
      }
    }

    console.log(cliUI.infoText(`>> Call "${args.actionName}" with params:`), payload)

    broker.call(args.actionName, payload, callOptions)
      .then(result => handleResult(result, args))
      .catch(error => handleError(error))
      .finally(done)
  }
