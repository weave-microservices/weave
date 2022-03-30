const path = require('path');
const fs = require('fs');
const { isFunction } = require('@weave-js/utils');

exports.loadServices = (broker, param) => {
  const servicePathsParams = param.split(',');
  for (const servicePathParam of servicePathsParams) {
    const servicePath = path.isAbsolute(servicePathParam) ? servicePathParam : path.resolve(process.cwd(), servicePathParam);

    if (!fs.existsSync(servicePath)) {
      broker.handleError(new Error(`Path not found: ${servicePath}`));
    }

    const isDir = fs.lstatSync(servicePath).isDirectory();

    if (isDir) {
      // if there is an index file in the folder, we use this file as factory
      // Otherwise we load all service files from the folder.
      // if (fs.existsSync(path.join(servicePath, 'index.js'))) {
      //   const serviceFactory = require(path.join(servicePath, 'index.js'));
      //   if (isFunction(serviceFactory)) {
      //     serviceFactory(broker);
      //     return;
      //   } else {
      //     broker.log.debug(`An index.js file was found in the "${servicePath}" folder. Since it is not a service loader function, it was ignored.`);
      //   }
      // }

      broker.loadServices(servicePath);
    } else {
      broker.loadService(servicePath);
    }
  }
};
