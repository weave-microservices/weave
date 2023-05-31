const { createServiceFromSchema } = require('../registry/service/service.js');
const { WeaveError } = require('../errors');

exports.initServiceManager = (runtime) => {
  const { options, log, eventBus, transport, state, registry, handleError } = runtime;

  // Internal service list
  const serviceList = [];

  const serviceChanged = (isLocalService = false) => {
    eventBus.broadcastLocal('$services.changed', { isLocalService });

    if (state.isStarted && isLocalService && transport) {
      transport.sendNodeInfo();
    }
  };

  Object.defineProperty(runtime, 'services', {
    value: {
      serviceList,
      serviceChanged,
      createService (schema) {
        try {
          const newService = createServiceFromSchema(runtime, schema);

          if (runtime.state.isStarted) {
            newService.start().catch(error => log.error(`Unable to start service ${newService.name}: ${error}`));
          }

          return newService;
        } catch (error) {
          log.error(error);
          handleError(error);
        }
      },
      /**
       * Wait for services before continuing startup.
       * @param {Array.<string>} serviceNames Names of the services
       * @param {Number} timeout Time in Miliseconds before the broker stops.
       * @param {Number} interval Time in Miliseconds to check for services.
       * @returns {Promise} Promise
      */
      waitForServices (serviceNames, timeout, interval = 500) {
        if (!Array.isArray(serviceNames)) {
          serviceNames = [serviceNames];
        }

        const startTimestamp = Date.now();
        return new Promise((resolve, reject) => {
          // todo: add timout for service waiter
          log.warn(`Waiting for services '${serviceNames.join(',')}'`);

          const serviceCheck = () => {
            const count = serviceNames.filter(serviceName => registry.hasService(serviceName));

            log.warn(`${count.length} services of ${serviceNames.length} available. Waiting...`);

            if (count.length === serviceNames.length) {
              return resolve();
            }

            if (timeout && (Date.now() - startTimestamp) > timeout) {
              return reject(new WeaveError('The waiting of the services is interrupted due to a timeout.', {
                code: 'WAIT_FOR_SERVICE',
                data: {
                  services: serviceNames
                }
              }));
            }

            options.waitForServiceInterval = setTimeout(serviceCheck, interval);
          };

          serviceCheck();
        });
      },
      /**
       * Destroy a service
       * @param {Service} service Service
       * @returns {Promise<any>} result
       */
      async destroyService (service) {
        try {
          await service.stop();

          registry.deregisterService(service.name, service.version);
          serviceList.splice(serviceList.indexOf(service), 1);
          log.info(`Service "${service.name}" was deregistered.`);
          serviceChanged(true);
        } catch (error) {
          log.error(error, `Unable to stop service "${service.name}"`);
        }
      }
    }
  });
};
