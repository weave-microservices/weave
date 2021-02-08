const { readdirSync } = require('fs')
const { join } = require('path')

readdirSync(join(__dirname, '/')).forEach(file => {
  if (file.match(/\.js$/) !== null && file !== 'index.js') {
    const module = require('./' + file)
    Object.keys(module).map(exportName => {
      exports[exportName] = module[exportName]
    })
  }
})

module.exports = {
  ...require('./bytes-to-size'),
  ...require('./clone'),
  ...require('./compact'),
  ...require('./cpu-usage'),
  ...require('./debounce'),
  ...require('./defaults'),
  ...require('./delay'),
  ...require('./dot-get'),
  ...require('./dot-set'),
  ...require('./event-bus'),
  ...require('./flatten'),
  ...require('./flatten-deep'),
  ...require('./get-IP-list'),
  ...require('./is-function'),
  ...require('./is-json-string'),
  ...require('./is-object'),
  ...require('./is-plain-object'),
  ...require('./is-stream-object-mode'),
  ...require('./is-stream'),
  ...require('./is-string'),
  ...require('./match'),
  ...require('./merge'),
  ...require('./omit'),
  ...require('./promise-delay'),
  ...require('./promise-timeout'),
  ...require('./promisify'),
  ...require('./random-string'),
  ...require('./remove'),
  ...require('./safe-copy'),
  ...require('./timespan'),
  ...require('./uuid'),
  ...require('./wrap-handler'),
  ...require('./wrap-in-array')
}

