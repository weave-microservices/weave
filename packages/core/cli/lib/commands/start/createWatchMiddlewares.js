const path = require('path');
const { debounce } = require('@weave-js/utils');
const fs = require('fs');
// const watch = require('../../utils/watchRecursive');

function createWatchMiddleware (weaveCli) {
  return function watchMiddleware (runtime) {
    let projectFiles = new Map();
    let previousProjectFiles = new Map();
    const cache = new Map();

    function clearRequireCache (filename) {
      Object.keys(require.cache).forEach((key) => {
        if (key === filename) {
          delete require.cache[key];
        }
      });
    }

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

    function isWeaveConfigFile (filename) {
      return (
        filename.endsWith('weave.config.js') ||
        filename.endsWith('weave.config.ts') ||
        filename.endsWith('weave.config.json')
      );
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
     * @param {*} parents Parnet files
     * @returns {void}
     */
    function processModule (module, service = null, level = 0, parents = []) {
      const filename = module.filename;
      // Avoid circular dependency in project files
      if (parents && parents.indexOf(filename) !== -1) {
        return;
      }

      if (filename.indexOf('node_modules') !== -1) {
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
      }

      if (module.children && module.children.length > 0) {
        // todo: Check if the file is a weave config file
        // Check if file os a service file
        parents.push(filename);
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

        } else if (watchItem.services.length > 0) {

        }

        watchItem.watcher = fs.watch(relativePath, (eventType) => {
          runtime.log.info(`The file "${relativePath}" has been changed. (${eventType})`);

          clearRequireCache(filename);

          if (watchItem.restartBroker) {
            Object.keys(require.cache).forEach(key => delete require.cache[key]);
            weaveCli.restartBroker();
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
