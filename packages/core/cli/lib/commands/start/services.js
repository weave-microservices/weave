const path = require('path');
const fs = require('fs');

exports.loadServices = (broker, param) => {
  const servicePathsParams = param.split(',');
  for (const servicePathParam of servicePathsParams) {
    const servicePath = path.isAbsolute(servicePathParam) ? servicePathParam : path.resolve(process.cwd(), servicePathParam);

    if (!fs.existsSync(servicePath)) {
      broker.handleError(new Error(`Path not found: ${servicePath}`));
    }

    const isDir = fs.lstatSync(servicePath).isDirectory();

    if (isDir) {
      broker.loadServices(servicePath);
    } else {
      broker.loadService(servicePath);
    }
  }
};
