const { createBroker } = require('@weave-js/core');
const repl = require('@weave-js/repl');
const { getConfig } = require('../../utils/config');
const { createWatchMiddleware } = require('./createWatchMiddlewares');
const { loadServices } = require('./loadServices');

exports.handler = async (args) => {
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
      const customMiddlewares = config.middlewares || [];
      config.middlewares = [
        createWatchMiddleware(cliContext),
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

    // if (args.serviceManifest) {
    //   const serviceManifest = require(args.serviceManifest);
    //   if (!serviceManifest) {
    //     throw new Error('Service manifest not found');
    //   }
    // }

    await cliContext.broker.start();

    if (args.repl) {
      repl(cliContext.broker);
    }
  } catch (error) {
    console.error(error);
  }
};
