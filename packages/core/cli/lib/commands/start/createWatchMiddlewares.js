const path = require('path');
const { debounce } = require('@weave-js/utils');
const fs = require('fs');

function clearRequireCache (filename) {
  Object.keys(require.cache).forEach((key) => {
    if (key === filename) {
      delete require.cache[key];
    }
  });
}

function isWeaveConfigFile (filename) {
  return (
    filename.endsWith('weave.config.js') ||
    filename.endsWith('weave.config.ts') ||
    filename.endsWith('weave.config.json')
  );
}

function createWatchMiddleware (weaveCli) {
  return function watchMiddleware (runtime) {
    let projectFiles = new Map();
    let previousProjectFiles = new Map();
    const cache = new Map();

    async function reloadService (service) {
      const relativePath = path.relative(process.cwd(), service.filename);
      runtime.log.info(`Reloading service ${service.name}... {${relativePath}}`);
      await runtime.services.destroyService(service);

      if (fs.existsSync(service.filename)) {
        await runtime.broker.loadService(service.filename);
      }
    }

    function getFileWatchItem (filename) {
      const item = projectFiles.get(filename);
      if (item) {
        return item;
      }

      const newWatchItem = {
        services: [],
        otherFiles: [],
        restartBroker: false,
        restartAllServices: false
      };

      projectFiles.set(filename, newWatchItem);

      return newWatchItem;
    }

    function stopFileWatcher (files) {
      files.forEach((watchItem, filename) => {
        if (watchItem.watcher) {
          watchItem.watcher.close();
          delete watchItem.watcher;
        }
      });
    }

    /**
     * Process Modules
     * @param {object} module Modle
     * @param {string} service Service
     * @param {*} level Call level
     * @param {*} parents Parent files
     * @returns {void}
     */
    function processModule (module, service = null, level = 0, parents = null) {
      const filename = module.filename;

      // skip node_modules
      if ((service || parents) && filename.includes('node_modules')) {
        return;
      }

      // Avoid circular dependency in project files
      if (parents && parents.includes(filename)) {
        return;
      }

      if (filename.includes('node_modules')) {
        if (cache.get(filename)) {
          return;
        }
        cache.set(filename, module);
      }

      if (!service) {
        service = runtime.services.serviceList.find((service) => service.filename === filename);
      }

      if (service) {
        // get watch item
        const watchItem = getFileWatchItem(filename);
        if (!watchItem.services.includes(service.fullyQualifiedName)) {
          watchItem.services.push(service.fullyQualifiedName);
        }
      } else if (isWeaveConfigFile(filename)) {
        const watchItem = getFileWatchItem(filename);
        watchItem.restartBroker = true;
      } else {
        if (parents) {
          const watchItem = getFileWatchItem(filename);
          watchItem.otherFiles.push(filename);
          watchItem.restartAllServices = true;
        }
      }

      if (module.children && module.children.length > 0) {
        if (service) {
          // Check if file is a service file
          parents = parents ? parents.concat([filename]) : [filename];
        } else if (isWeaveConfigFile(filename)) {
          parents = [];
        } else if (parents) {
          parents.push(filename);
        }
        module.children.forEach((childModule) => {
          processModule(childModule, service, level + 1, parents);
        });
      }
    }

    function watchProjectFiles () {
      if (!runtime.state.isStarted) {
        return;
      }

      cache.clear();
      previousProjectFiles = projectFiles;
      projectFiles = new Map();

      const mainModule = process.mainModule;

      processModule(mainModule);

      const needToReload = new Set();

      const reloadServices = debounce(() => {
        needToReload.forEach((service) => {
          reloadService(service);
        });

        runtime.log.info(`Reload ${needToReload.size} ${needToReload.size > 1 ? 'services' : 'service'}`);

        needToReload.clear();
      }, 500);

      stopFileWatcher(previousProjectFiles);

      projectFiles.forEach((_, filename) => {
        if (!fs.existsSync(filename)) {
          projectFiles.delete(filename);
        }
      });

      projectFiles.forEach((watchItem, filename) => {
        const relativePath = path.relative(process.cwd(), filename);
        if (watchItem.restartBroker) {
          runtime.log.debug(`${relativePath}: Requires broker restart`);
        } else if (watchItem.restartAllServices) {
          runtime.log.debug(`${relativePath}: Requires all services restart`);
        } else if (watchItem.services.length > 0) {
          runtime.log.debug(`Reloading ${watchItem.services.length} services... {${relativePath}}`);
        }

        // Attach file watcher to watch item.
        // `triggeredChangeEvents` stores the last mtime from file to prevent double triggered events.
        const triggeredChangeEvents = new Map();
        watchItem.watcher = fs.watch(relativePath, (eventType) => {
          // store mtime of file to prevent double triggered events.
          const stats = fs.statSync(relativePath);
          const seconds = +stats.mtime;
          if (triggeredChangeEvents.get(relativePath) === seconds) {
            return;
          }

          triggeredChangeEvents.set(relativePath, seconds);

          runtime.log.info(`The file "${relativePath}" has been changed. (${eventType})`);

          clearRequireCache(filename);

          if (watchItem.otherFiles.length > 0) {
            watchItem.otherFiles.forEach((otherFile) => {
              clearRequireCache(otherFile);
            });
          }

          if (watchItem.restartBroker) {
            Object.keys(require.cache).forEach(key => delete require.cache[key]);
            weaveCli.restartBroker();
          } else if (watchItem.restartAllServices) {
            runtime.services.serviceList.forEach((service) => {
              if (service.filename) {
                needToReload.add(service);
              }
            });

            reloadServices();
          } else {
            runtime.services.serviceList.forEach((service) => {
              if (watchItem.services.indexOf(service.fullyQualifiedName) !== -1) {
                needToReload.add(service);
              }
            });
            reloadServices();
          }
        });
      });
    }

    const debouncedWatchProjectFiles = debounce(watchProjectFiles, 2000);

    return {
      started () {
        runtime.log.info('File watcher is active.');
        watchProjectFiles();
      },
      serviceStarted () {
        if (runtime.state.isStarted) {
          debouncedWatchProjectFiles();
        }
      },
      stopped () {

      }
    };
  };
};

module.exports = { createWatchMiddleware };
