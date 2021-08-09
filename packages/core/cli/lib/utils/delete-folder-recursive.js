const fs = require('fs')
const path = require('path')

exports.deleteFolderRecursive = (dirPath) => {
  if (fs.existsSync(dirPath)) {
    fs.readdirSync(dirPath).forEach(function (entry) {
      var entryPath = path.join(dirPath, entry)
      if (fs.lstatSync(entryPath).isDirectory()) {
        exports.deleteFolderRecursive(entryPath)
      } else {
        fs.unlinkSync(entryPath)
      }
    })
    fs.rmdirSync(dirPath)
  }
}
