
const fs = require('fs')
const path = require('path')
const mkdirp = require('mkdirp')
const home = require('user-home')

const deleteFolder = (dirPath) => {
  if (fs.existsSync(dirPath)) {
    fs.readdirSync(dirPath).forEach(function (entry) {
      var entryPath = path.join(dirPath, entry)
      if (fs.lstatSync(entryPath).isDirectory()) {
        deleteFolder(entryPath)
      } else {
        fs.unlinkSync(entryPath)
      }
    })
    fs.rmdirSync(dirPath)
  }
}

exports.getTempDir = (dir, clear = false) => {
  const tmp = path.join(home, '.weave-cli-templates', dir.replace(/[^a-zA-Z0-9]/g, '-'))
  if (fs.existsSync(tmp) && clear) {
    deleteFolder(tmp)
  }
  mkdirp(tmp)
  return tmp
}
