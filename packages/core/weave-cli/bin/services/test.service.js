const fs = require('fs')

module.exports = {
  name: 'test',
  actions: {
    get (context) {
      return fs.createReadStream(__dirname + '/file.bin')
    },
    error () {
      throw new Error('aaargcall')
    }
  }
}
