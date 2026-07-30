import os from "os";
import fs from "fs";
import path from "path";
import Cache from "./ttlCache.mts";
const isLinux = os.platform() === "linux"; // native recursive watching not supported here
const watchDirectory = isLinux ? watchFallback : watchRecursive;

export default watch;

function watch(name: string, onchange: (filename: string) => void): () => void {
  let clear: (() => void) | null = null;
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

function watchFile(filename: string, onchange: (filename: string) => void): () => void {
  let prev: fs.Stats | null = null;
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

function watchRecursive(directory: string, onchange: (filename: string) => void): () => void {
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

function watchFallback(directory: string, onchange: (filename: string) => void): () => void {
  const watching: Record<string, fs.FSWatcher> = {};
  let loaded = false;
  const queued: string[] = [];
  const prevs = new Cache<fs.Stats>({ ttl: 2e3, capacity: 30 });

  visit(".", function () {
    loaded = true;
  });

  return function () {
    Object.keys(watching).forEach(function (dir) {
      watching[dir].close();
    });
  };

  function emit(name: string): void {
    queued.push(name);
    if (queued.length === 1) update();
  }

  function update(): void {
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

  function visit(next: string, cb: (err?: Error) => void): void {
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
        if (filename) {
          filename = path.join(next, filename);
          emit(path.join(directory, filename));
        }
      });

      w.on("error", noop);
      watching[dir] = w;

      fs.readdir(dir, function (err, list) {
        if (err) return cb(err);

        loop();

        function loop() {
          if (!list.length) {
            return cb();
          }
          const item = list.shift();
          if (item) {
            visit(path.join(next, item), loop);
          }
        }
      });
    });
  }
}

function noop(): void {}

function same(a: fs.Stats | null, b: fs.Stats | null): boolean {
  if (!a || !b) return false;
  return (
    a.dev === b.dev &&
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
    a.ctime.getTime() === b.ctime.getTime()
  );
}
