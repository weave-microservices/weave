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
      args: args, // Store args for config reloading
      isRestarting: false, // Flag to prevent restart loops
      async restartBroker () {
        // Prevent multiple concurrent restarts
        if (this.isRestarting) {
          return;
        }

        const broker = this.broker;
        if (broker) {
          try {
            this.isRestarting = true;
            broker.log.info('Stopping broker for restart...');
            await this.broker.stop();

            // Reload config from file system
            broker.log.info('Reloading configuration...');
            const freshConfig = getConfig(this.args);

            // Apply watch middleware if needed
            if (this.args.watch) {
              const additionalFiles = [];

              if (this.args.factory) {
                const serviceFactoryPath = path.isAbsolute(this.args.factory) ? this.args.factory : path.resolve(process.cwd(), this.args.factory);
                if (fs.existsSync(serviceFactoryPath)) {
                  additionalFiles.push({
                    filename: serviceFactoryPath,
                    changeScope: 'services'
                  });
                }
              }

              const customMiddlewares = freshConfig.middlewares || [];
              freshConfig.middlewares = [
                createWatchMiddleware(this, { additionalFiles }),
                ...customMiddlewares
              ];
            }

            if (this.args.silent) {
              freshConfig.logger = freshConfig.logger ? Object.assign(freshConfig.logger, { enabled: false }) : { enabled: false };
            }

            // Create new broker with fresh config
            broker.log.info('Creating new broker with updated configuration...');
            this.broker = createBroker(freshConfig);

            // Reload services
            if (this.args.services) {
              loadServices(this.broker, this.args.services);
            }

            if (this.args.factory) {
              loadServicesFromFactory(this.broker, this.args.factory);
            }

            await this.broker.start();

            // Restart REPL if it was enabled
            if (this.args.repl) {
              repl(this.broker);
            }

            this.broker.log.info('Broker restarted successfully with new configuration');

            // Reset restart flag after a short delay to prevent rapid successive restarts
            setTimeout(() => {
              this.isRestarting = false;
            }, 1000);
          } catch (error) {
            broker.log.error('Error while restarting broker', error);
            this.isRestarting = false; // Reset flag on error
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
