const os = require('os');
const fs = require('fs');
const path = require('path');
const Cache = require('./ttlCache');
const isLinux = os.platform() === 'linux'; // native recursive watching not supported here
const watchDirectory = isLinux ? watchFallback : watchRecursive;

module.exports = watch;

function watch (name, onchange) {
  let clear = null;
  let stopped = false;

  fs.lstat(name, function (_, st) {
    if (!st || stopped) {
      stopped = true;
      return;
    }
    clear = st.isDirectory() ? watchDirectory(name, onchange) : watchFile(name, onchange);
  });

  return function () {
    if (stopped) return;
    stopped = true;
    if (clear) {
      clear();
    }
  };
}

function watchFile (filename, onchange) {
  let prev = null;
  let prevTime = 0;

  const w = fs.watch(filename, function () {
    fs.lstat(filename, function (_, st) {
      const now = Date.now();
      if (now - prevTime > 2000 || !same(st, prev)) onchange(filename);
      prevTime = now;
      prev = st;
    });
  });

  return function () {
    w.close();
  };
}

function watchRecursive (directory, onchange) {
  const w = fs.watch(directory, { recursive: true }, function (change, filename) {
    if (!filename) {
      return; // filename not always given (https://nodejs.org/api/fs.html#fs_filename_argument)
    }
    onchange(path.join(directory, filename));
  });

  return function () {
    w.close();
  };
}

function watchFallback (directory, onchange) {
  const watching = {};
  let loaded = false;
  const queued = [];
  const prevs = new Cache({ ttl: 2e3, capacity: 30 });

  visit('.', function () {
    loaded = true;
  });

  return function () {
    Object.keys(watching).forEach(function (dir) {
      watching[dir].close();
    });
  };

  function emit (name) {
    queued.push(name);
    if (queued.length === 1) update();
  }

  function update () {
    const filename = queued[0];

    fs.lstat(filename, function (err, st) {
      const w = watching[filename];

      if (err && w) {
        w.close();
        delete watching[filename];
      }

      const prevSt = prevs.get(filename);
      if (!prevSt || !same(st, prevSt)) onchange(filename);
      prevs.put(filename, st);

      visit(path.relative(directory, filename), function () {
        queued.shift();
        if (queued.length) update();
      });
    });
  }

  function visit (next, cb) {
    const dir = path.join(directory, next);

    fs.lstat(dir, function (err, st) {
      if (err || !st.isDirectory()) {
        return cb();
      }
      if (watching[dir]) {
        return cb();
      }
      if (loaded) {
        emit(dir);
      }

      const w = fs.watch(dir, function (change, filename) {
        filename = path.join(next, filename);
        emit(path.join(directory, filename));
      });

      w.on('error', noop);
      watching[dir] = w;

      fs.readdir(dir, function (err, list) {
        if (err) return cb(err);

        loop();

        function loop () {
          if (!list.length) {
            return cb();
          }
          visit(path.join(next, list.shift()), loop);
        }
      });
    });
  }
}

function noop () {}

function same (a, b) {
  if (!a || !b) return false;
  return a.dev === b.dev &&
    a.mode === b.mode &&
    a.nlink === b.nlink &&
    a.uid === b.uid &&
    a.gid === b.gid &&
    a.rdev === b.rdev &&
    a.blksize === b.blksize &&
    a.ino === b.ino &&
    // a.size === b.size && DONT TEST - is a lying value
    // a.blocks === b.blocks && DONT TEST - is a lying value
    a.atime.getTime() === b.atime.getTime() &&
    a.mtime.getTime() === b.mtime.getTime() &&
    a.ctime.getTime() === b.ctime.getTime();
}
