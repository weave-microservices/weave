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
