import { createServiceFromSchema } from "../registry/service/service.mts";
import { WeaveError } from "../errors.mts";
import type { Runtime, Service, ServiceSchema } from "../../types/index.js";

export const initServiceManager = (runtime: Runtime): void => {
  const { options, log, eventBus, transport, state, registry, handleError, middlewareHandler } =
    runtime;

  // Internal service list
  const serviceList: Service[] = [];

  const serviceChanged = (isLocalService: boolean = false): void => {
    eventBus.broadcastLocal("$services.changed", { isLocalService });
    middlewareHandler.callHandlersAsync("serviceChanged", [isLocalService]);
    if (state.isStarted && isLocalService && transport) {
      transport.sendNodeInfo?.();
    }
  };

  Object.defineProperty(runtime, "services", {
    value: {
      serviceList,
      serviceChanged,
      createService(schema: ServiceSchema): Service | undefined {
        try {
          const newService = createServiceFromSchema(runtime, schema);

          if (runtime.state.isStarted) {
            newService
              .start()
              .catch((error) => log.error(`Unable to start service ${newService.name}: ${error}`));
          }

          return newService;
        } catch (error) {
          log.error(error as Error);
          handleError(error as Error);
        }
      },
      /**
       * Wait for services before continuing startup.
       * @param {Array.<string>} serviceNames Names of the services
       * @param {Number} timeout Time in Miliseconds before the broker stops.
       * @param {Number} interval Time in Miliseconds to check for services.
       * @returns {Promise} Promise
       */
      waitForServices(
        serviceNames: string | string[],
        timeout: number,
        interval: number = 500,
      ): Promise<void> {
        if (!Array.isArray(serviceNames)) {
          serviceNames = [serviceNames];
        }

        const startTimestamp = Date.now();
        return new Promise<void>((resolve, reject) => {
          // todo: add timout for service waiter
          log.warn(`Waiting for services '${(serviceNames as string[]).join(",")}'`);

          const serviceCheck = (): void => {
            const count = (serviceNames as string[]).filter((serviceName: string) =>
              registry.hasService(serviceName),
            );

            log.warn(
              `${count.length} services of ${(serviceNames as string[]).length} available. Waiting`,
            );

            if (count.length === (serviceNames as string[]).length) {
              resolve();
              return;
            }

            if (timeout && Date.now() - startTimestamp > timeout) {
              return reject(
                new WeaveError("The waiting of the services is interrupted due to a timeout.", {
                  code: "WAIT_FOR_SERVICE",
                  data: {
                    services: serviceNames,
                  },
                }),
              );
            }

            (options as Record<string, unknown>).waitForServiceInterval = setTimeout(
              serviceCheck,
              interval,
            );
          };

          serviceCheck();
        });
      },
      /**
       * Destroy a service
       * @param {Service} service Service
       * @returns {Promise<any>} result
       */
      async destroyService(service: Service): Promise<void> {
        try {
          await service.stop();

          registry.deregisterService(service.name, service.version);
          serviceList.splice(serviceList.indexOf(service), 1);
          log.debug(`Service "${service.name}" was deregistered.`);
          serviceChanged(true);
        } catch (error) {
          log.error(error as Error, `Unable to stop service "${service.name}"`);
        }
      },
    },
  });
};
