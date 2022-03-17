
const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const home = require('user-home');
const { deleteFolderRecursive } = require('./delete-folder-recursive');

exports.getTempDir = (dir, clear = false) => {
  const tmp = path.join(home, '.weave-cli-templates', dir.replace(/[^a-zA-Z0-9]/g, '-'));
  if (fs.existsSync(tmp) && clear) {
    deleteFolderRecursive(tmp);
  }
  mkdirp(tmp);
  return tmp;
};
