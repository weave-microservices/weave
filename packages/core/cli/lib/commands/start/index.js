const { createBroker } = require('@weave-js/core');
const repl = require('@weave-js/repl');
const { getConfig } = require('../../utils/config');
const { createWatchMiddleware } = require('./createWatchMiddlewares');
const { loadServices, loadServicesFromFactory } = require('./loadServices');
const path = require('path');
const fs = require('fs');

exports.handler = async (args) => {
  if (args.dotenv) {
    const dotEnvPath = typeof args.dotenv === 'string' ? args.dotenv : path.resolve(process.cwd(), '.env');
    require('dotenv').config({ path: dotEnvPath });
  }

  try {
    const cliContext = {
      broker: null,
      async restartBroker () {
        const broker = this.broker;
        if (broker) {
          try {
            await this.broker.stop();
            await this.broker.start();
          } catch (error) {
            broker.log.error('Error while stopping broker', error);
          }
        }
      }
    };

    const config = getConfig(args);

    if (args.watch) {
      const additionalFiles = [];

      if (args.services) {
      }

      if (args.factory) {
        const serviceFactoryPath = path.isAbsolute(args.factory) ? args.factory : path.resolve(process.cwd(), args.factory);
        if (fs.existsSync(serviceFactoryPath)) {
          additionalFiles.push({
            filename: serviceFactoryPath,
            changeScope: 'services'
          });
        }
      }

      const customMiddlewares = config.middlewares || [];
      config.middlewares = [
        createWatchMiddleware(cliContext, { additionalFiles }),
        ...customMiddlewares
      ];
    }

    if (args.silent) {
      config.logger = config.logger ? Object.assign(config.logger, { enabled: false }) : { enabled: false };
    }

    cliContext.broker = createBroker(config);

    if (args.services) {
      loadServices(cliContext.broker, args.services);
    }

    if (args.factory) {
      loadServicesFromFactory(cliContext.broker, args.factory);
    }

    await cliContext.broker.start();

    if (args.repl) {
      repl(cliContext.broker);
    }
  } catch (error) {
    console.error(error);
  }
};
