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

// module.exports = {
//   ...require('./bytes-to-size'),
//   ...require('./clone'),
//   ...require('./event-emitter-mixin'),
//   ...require('./get-IP-list'),
//   ...require('./save-copy'),
//   ...require('./is-plain-object'),
//   ...require('./match'),
//   ...require('./options.js'),
//   ...require('./promise-timeout'),
//   ...require('./uuid')
// }
