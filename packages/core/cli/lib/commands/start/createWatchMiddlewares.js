const { debounce } = require('@weave-js/utils');
const path = require('path');
const fs = require('fs');

const MAX_RECURSION_DEPTH = 100;
const MAX_PARENTS_SIZE = 1000;

const globalWatchers = new Map();

/**
 * Clean up all existing file watchers
 */
function cleanupAllWatchers () {
  globalWatchers.forEach((watcher, filename) => {
    try {
      watcher.close();
    } catch (error) {
      // Silently handle watcher close errors
    }
  });
  globalWatchers.clear();
}

function clearRequireCache (filename) {
  try {
    // Validate the filename to prevent path traversal
    const resolvedPath = path.resolve(filename);
    const cwd = process.cwd();

    // Only allow clearing cache for files within the project directory or node_modules
    if (!resolvedPath.startsWith(cwd) && !resolvedPath.includes('node_modules')) {
      return;
    }

    Object.keys(require.cache).forEach((key) => {
      if (key === resolvedPath) {
        delete require.cache[key];
      }
    });
  } catch (error) {
    // Silently fail for invalid paths
  }
}

function isWeaveConfigFile (filename) {
  try {
    const basename = path.basename(filename);
    return (
      basename === 'weave.config.js' ||
      basename === 'weave.config.ts' ||
      basename === 'weave.config.json'
    );
  } catch (error) {
    return false;
  }
}

function isValidFilePath (filepath) {
  try {
    const resolvedPath = path.resolve(filepath);
    const cwd = process.cwd();

    // Only allow files within the project directory or node_modules
    return resolvedPath.startsWith(cwd) || resolvedPath.includes('node_modules');
  } catch (error) {
    return false;
  }
}

/**
 * @typedef {Object} AdditionalFile
 * @property {string} filename Filename
 * @property {string} changeScope Change scope
 */

/**
 * @typedef {Object} WatcherOptions
 * @property {AdditionalFile[]} additionalFiles Additional files to watch
 */

/**
 * Creates an Weave watch middleware
 * @param {any} weaveCli weave CLI instance
 * @param {WatcherOptions} options weave middleware options
 * @returns {any} Middleware
 */
function createWatchMiddleware (weaveCli, options) {
  return function watchMiddleware (runtime) {
    let projectFiles = new Map();
    let previousProjectFiles = new Map();
    const cache = new Map();

    async function reloadService (service) {
      try {
        if (!service || !service.filename) {
          return;
        }

        // Validate service filename
        if (!isValidFilePath(service.filename)) {
          runtime.log.warn(`Invalid service path: ${service.filename}`);
          return;
        }

        const relativePath = path.relative(process.cwd(), service.filename);
        runtime.log.info(`Reloading service ${service.name}... {${relativePath}}`);
        await runtime.services.destroyService(service);

        if (fs.existsSync(service.filename)) {
          try {
            await runtime.broker.loadService(service.filename);
          } catch (error) {
            runtime.log.error(`Failed to load service "${service.filename}"`, error);
          }
        }
      } catch (error) {
        runtime.log.error(`Error reloading service:`, error);
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
      files.forEach((watchItem) => {
        if (watchItem.watcher) {
          try {
            watchItem.watcher.close();
          } catch (error) {
            // Silently handle watcher close errors
          }
          delete watchItem.watcher;
        }
      });
    }

    /**
     * Process Modules
     * @param {object} module Module
     * @param {import('@weave-js/core').Service} service Service
     * @param {*} level Call level
     * @param {*} parents Parent files
     * @returns {void}
     */
    function processModule (module, service, level = 0, parents = null) {
      // Prevent infinite recursion
      if (level > MAX_RECURSION_DEPTH) {
        return;
      }

      // Prevent excessive parent tracking
      if (parents && parents.length > MAX_PARENTS_SIZE) {
        return;
      }

      if (!module || !module.filename) {
        return;
      }

      const filename = module.filename;

      // Validate file path
      if (!isValidFilePath(filename)) {
        return;
      }

      if ((service || parents) && filename.includes('node_modules')) {
        return;
      }

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
        const watchItem = getFileWatchItem(filename);
        if (!watchItem.services.includes(service.fullyQualifiedName)) {
          watchItem.services.push(service.fullyQualifiedName);
        }

        // Add dependency files to the service's watch item
        if (parents && parents.length > 0) {
          parents.forEach(parentFile => {
            if (parentFile !== filename) {
              watchItem.otherFiles.push(parentFile);
            }
          });
        }
      } else if (isWeaveConfigFile(filename)) {
        const watchItem = getFileWatchItem(filename);
        watchItem.restartBroker = true;
      } else {
        // For dependency files, track which services depend on them
        if (parents && parents.length > 0) {
          const watchItem = getFileWatchItem(filename);
          // Find the service file in the parents chain
          const serviceFile = parents.find(parent => {
            return runtime.services.serviceList.some(s => s.filename === parent);
          });

          if (serviceFile) {
            const service = runtime.services.serviceList.find(s => s.filename === serviceFile);
            if (service && !watchItem.services.includes(service.fullyQualifiedName)) {
              watchItem.services.push(service.fullyQualifiedName);
              const relativePath = path.relative(process.cwd(), filename);
              runtime.log.debug(`Dependency "${relativePath}" linked to service "${service.fullyQualifiedName}"`);
            }
          }
        }
      }

      if (module.children && module.children.length > 0) {
        if (service) {
          parents = parents ? parents.concat([filename]) : [filename];
        } else if (isWeaveConfigFile(filename)) {
          parents = [];
        } else if (parents) {
          parents.push(filename);
        }
        module.children.forEach((childModule) => {
          const childLevel = service ? level + 1 : 0;
          // if (!service && !parents) {
          //   parents = [filename];
          // }
          processModule(childModule, service, childLevel, parents);
        });
      }
    }

    function watchProjectFiles () {
      if (!runtime.state.isStarted) {
        return;
      }

      // Clean up all existing watchers to prevent duplicates
      cleanupAllWatchers();

      cache.clear();
      previousProjectFiles = projectFiles;
      projectFiles = new Map();

      const mainModule = process.mainModule || require.main;

      if (mainModule) {
        processModule(mainModule);
      }

      // Also directly process services from the serviceList
      runtime.services.serviceList.forEach((service) => {
        if (service.filename && isValidFilePath(service.filename)) {
          const watchItem = getFileWatchItem(service.filename);
          if (!watchItem.services.includes(service.fullyQualifiedName)) {
            watchItem.services.push(service.fullyQualifiedName);
          }

          // Also process dependencies from require.cache for this service
          const serviceModule = require.cache[service.filename];
          if (serviceModule) {
            processModule(serviceModule, service, 0, []);
          }
        }
      });

      // Explicitly watch for config files in the current directory
      const configFiles = [
        'weave.config.js',
        'weave.config.ts',
        'weave.config.json'
      ];

      configFiles.forEach((configFileName) => {
        const configPath = path.resolve(process.cwd(), configFileName);
        try {
          if (fs.existsSync(configPath) && isValidFilePath(configPath)) {
            const watchItem = getFileWatchItem(configPath);
            watchItem.restartBroker = true;
          }
        } catch (error) {
          // Silently skip invalid config files
        }
      });

      if (options.additionalFiles) {
        options.additionalFiles.forEach((file) => {
          const watchItem = getFileWatchItem(file.filename);
          watchItem.otherFiles.push(file.filename);
          if (file.changeScope === 'broker') {
            watchItem.restartBroker = true;
          } else if (file.changeScope === 'services') {
            watchItem.restartAllServices = true;
          } else {
            watchItem.services.push(file.changeScope);
          }
        });
      }

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
        try {
          if (!fs.existsSync(filename)) {
            projectFiles.delete(filename);
          }
        } catch (error) {
          // Remove invalid files from tracking
          projectFiles.delete(filename);
        }
      });

      projectFiles.forEach((watchItem, filename) => {
        try {
          // Validate filename before processing
          if (!isValidFilePath(filename)) {
            return;
          }

          const relativePath = path.relative(process.cwd(), filename);
          if (watchItem.restartBroker) {
            runtime.log.debug(`${relativePath}: Requires broker restart`);
          } else if (watchItem.restartAllServices) {
            runtime.log.debug(`${relativePath}: Requires all services restart`);
          } else if (watchItem.services.length > 0) {
            runtime.log.debug(`Reloading ${watchItem.services.length} services... {${relativePath}}`);
          }

          // Skip if this file is already being watched globally
          if (globalWatchers.has(filename)) {
            return;
          }

          const triggeredChangeEvents = new Map();
          const watcher = fs.watch(filename, (eventType) => {
            try {
              const stats = fs.statSync(filename);
              const seconds = +stats.mtime;
              if (triggeredChangeEvents.get(filename) === seconds) {
                return;
              }

              triggeredChangeEvents.set(filename, seconds);

              runtime.log.info(`The file "${relativePath}" has been changed. (${eventType})`);

              // Debug logging for config files
              if (watchItem.restartBroker) {
                runtime.log.debug(`Config file change detected, preparing broker restart...`);
              }

              clearRequireCache(filename);

              if (watchItem.otherFiles.length > 0) {
                watchItem.otherFiles.forEach((otherFile) => {
                  clearRequireCache(otherFile);
                });
              }

              if (watchItem.restartBroker) {
                runtime.log.info(`Restarting broker due to config file change...`);
                // Safely clear require cache with validation
                const cwd = process.cwd();
                Object.keys(require.cache).forEach(key => {
                  try {
                    const resolvedKey = path.resolve(key);
                    if (resolvedKey.startsWith(cwd) || resolvedKey.includes('node_modules')) {
                      delete require.cache[key];
                    }
                  } catch (error) {
                    // Skip invalid keys
                  }
                });

                // Debounce broker restart to prevent restart loops
                const debouncedRestart = debounce(() => {
                  weaveCli.restartBroker();
                }, 500);

                debouncedRestart();
              } else if (watchItem.restartAllServices) {
                runtime.services.serviceList.forEach((service) => {
                  if (service.filename) {
                    needToReload.add(service);
                  }
                });

                reloadServices();
              } else if (watchItem.services.length > 0) {
                runtime.services.serviceList.forEach((service) => {
                  if (watchItem.services.indexOf(service.fullyQualifiedName) !== -1) {
                    needToReload.add(service);
                  }
                });

                if (needToReload.size === 0) {
                  needToReload.add(relativePath);
                }

                reloadServices();
              }
            } catch (error) {
              runtime.log.error(`Error handling file change for ${relativePath}:`, error);
            }
          });

          // Register watcher in global registry
          globalWatchers.set(filename, watcher);
        } catch (error) {
          runtime.log.error(`Error setting up watcher for ${filename}:`, error);
        }
      });
    }

    function addServiceToWatch (service) {
      if (service.filename && isValidFilePath(service.filename) && !projectFiles.has(service.filename)) {
        const watchItem = getFileWatchItem(service.filename);
        if (!watchItem.services.includes(service.fullyQualifiedName)) {
          watchItem.services.push(service.fullyQualifiedName);
        }

        // Skip if this file is already being watched globally
        if (globalWatchers.has(service.filename)) {
          return;
        }

        // Set up watcher for this new service file
        try {
          const relativePath = path.relative(process.cwd(), service.filename);
          runtime.log.debug(`Adding watcher for new service: ${relativePath}`);

          const triggeredChangeEvents = new Map();
          const watcher = fs.watch(service.filename, (eventType) => {
            try {
              const stats = fs.statSync(service.filename);
              const seconds = +stats.mtime;
              if (triggeredChangeEvents.get(service.filename) === seconds) {
                return;
              }

              triggeredChangeEvents.set(service.filename, seconds);
              runtime.log.info(`The file "${relativePath}" has been changed. (${eventType})`);

              clearRequireCache(service.filename);

              // Reload this specific service
              const needToReload = new Set([service]);
              const reloadServices = debounce(() => {
                needToReload.forEach((service) => {
                  reloadService(service);
                });
                runtime.log.info(`Reload ${needToReload.size} service`);
                needToReload.clear();
              }, 500);

              reloadServices();
            } catch (error) {
              runtime.log.error(`Error handling file change for ${relativePath}:`, error);
            }
          });

          // Register watcher in global registry
          globalWatchers.set(service.filename, watcher);
        } catch (error) {
          runtime.log.error(`Error setting up watcher for ${service.filename}:`, error);
        }
      }
    }

    return {
      started () {
        runtime.log.info('File watcher is active.');
        watchProjectFiles();
      },
      serviceStarted (service) {
        // Only add individual services to watch, don't re-scan everything
        if (runtime.state.isStarted && service) {
          addServiceToWatch(service);
        }
      },
      serviceCreated (service, schema) {
        if (!service.filename && schema.__filename) {
          service.filename = schema.__filename;
        }
        // Add the newly created service to watch
        if (runtime.state.isStarted) {
          addServiceToWatch(service);
        }
      }
    };
  };
};

module.exports = { createWatchMiddleware };
