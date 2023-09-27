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
      const folderContainsManifestFile = fs.existsSync(path.join(servicePath, 'index.js'));
      if (folderContainsManifestFile) {
        const serviceFactory = require(path.join(servicePath, 'index.js'));
        if (isFunction(serviceFactory)) {
          serviceFactory(broker);
          broker.log.warn(`An index.js file was found in the "${servicePath}" folder. Since it is not a service loader function, it was ignored.`);
          return;
        } else {
          broker.log.warn(`An index.js file was found in the "${servicePath}" folder. Since it is not a service loader function, it was ignored.`);
        }
      }

      broker.loadServices(servicePath);
    } else {
      broker.loadService(servicePath);
    }
  }
};

exports.loadServicesFromFactory = (broker, param) => {
  try {
    const serviceFactoryPath = path.isAbsolute(param) ? param : path.resolve(process.cwd(), param);
    const serviceFactory = require(serviceFactoryPath);

    if (!serviceFactory) {
      throw new Error('Service factory not found.');
    }

    if (isFunction(serviceFactory)) {
      serviceFactory(broker);
    } else {
      throw new Error('Service factory is not a function.');
    }
  } catch (error) {
    console.error(error);
  }
};
