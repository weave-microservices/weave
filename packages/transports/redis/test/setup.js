const fs = require('fs')
const path = require('path')
module.exports = filePrefix => {
  // delete db files after testing
  afterAll(() => {
    try {
      const files = ['test.db', 'threads.db', 'users.db']
      files.forEach(file => fs.unlink(path.join(__dirname, '..', `${filePrefix}_${file}`), () => {}))
    } catch (e) {}
  })
}
