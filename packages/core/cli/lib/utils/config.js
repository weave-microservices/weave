const path = require('path');
const fs = require('fs');
const { isString, dotSet } = require('@weave-js/utils');
const { getDefaultOptions } = require('@weave-js/core/lib/broker/defaultOptions');

const defaultConfigFileName = 'weave.config.js';
const defaultEnvPrefix = 'WV_';
const dotSeperator = '__';

const overridePropertiesFromEnvVariables = (config) => {
  Object.keys(process.env)
    .filter(key => key.startsWith(defaultEnvPrefix))
    .map(key => ({
      key,
      property: key.substr(defaultEnvPrefix.length)
    }))
    .forEach((envObject) => {
      const dotted = envObject.property
        .split(dotSeperator)
        .map(part => part.toLocaleLowerCase())
        .map(part => {
          return part.split('_')
            .map((value, index) => {
              return index === 0 ? value : value[0].toUpperCase() + value.substring(1);
            }).join('');
        }).join('.');

      dotSet(config, dotted, process.env[envObject.key]);
    });
  return config;
};

exports.getConfig = (flags) => {
  const currentPath = process.cwd();
  let filePath;
  if (flags.config && isString(flags.config)) {
    filePath = path.isAbsolute(flags.config) ? flags.config : path.resolve(process.cwd(), flags.config);
  }

  if (!filePath && fs.existsSync(path.resolve(currentPath, defaultConfigFileName))) {
    filePath = path.resolve(currentPath, defaultConfigFileName);
  }

  let config;

  if (filePath) {
    if (!fs.existsSync(filePath)) {
      throw new Error(`Config file not found: ${filePath}`);
    }

    const fileExtension = path.extname(filePath);

    switch (fileExtension) {
    case '.json':
    case '.js': {
      config = require(filePath);
      break;
    }
    default:
      throw new Error(`Not supported file extension: ${fileExtension}`);
    }
  } else {
    config = getDefaultOptions();
  }

  config = overridePropertiesFromEnvVariables(config);

  return config;
};
