const { createServiceFromSchema } = require('../registry/service')
const { WeaveError } = require('../errors')
const { debounce } = require('@weave-js/utils')
const fs = require('fs')

exports.initServiceManager = (runtime) => {
  const { options, log, eventBus, transport, state, registry, handleError } = runtime

  // Internal service list
  const serviceList = []

  const serviceChanged = (isLocalService = false) => {
    // Send local notification.
    eventBus.broadcastLocal('$services.changed', { isLocalService })

    // If the service is a local service - send current node information to other nodes
    if (state.isStarted && isLocalService && transport) {
      transport.sendNodeInfo()
    }
  }

  const destroyService = (service) => Promise.resolve()
    .then(() => service.stop())
    .then(() => log.info(`Service "${service.name}" was stopped.`))
    .then(() => {
      registry.deregisterService(service.name, service.version)
      log.info(`Service "${service.name}" was deregistered.`)
      // Remove service from service store.
      serviceList.splice(serviceList.indexOf(service), 1)
      // Fire services changed event
      serviceChanged(true)
      return Promise.resolve()
    })
    .catch(error => log.error(error, `Unable to stop service "${service.name}"`))

  // `onServiceFileChanged` only triggered by the file watcher
  const onServiceFileChanged = async (service) => {
    const filename = service.filename

    // Clear the require cache
    Object.keys(require.cache).forEach(key => {
      if (key === filename) {
        delete require.cache[key]
      }
    })

    // Service has changed - 1. destroy the service, then reload it
    await destroyService(service)
    await runtime.broker.loadService(filename)
  }

  Object.defineProperty(runtime, 'services', {
    value: {
      serviceList,
      serviceChanged,
      createService (schema) {
        try {
          const newService = createServiceFromSchema(runtime, schema)

          // if the broker is already startet, we need to start the service.
          if (runtime.state.isStarted) {
            newService.start().catch(error => log.error(`Unable to start service ${newService.name}: ${error}`))
          }

          return newService
        } catch (error) {
          log.error(error)
          handleError(error)
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
          serviceNames = [serviceNames]
        }

        const startTimestamp = Date.now()
        return new Promise((resolve, reject) => {
          // todo: add timout for service waiter
          log.warn(`Waiting for services '${serviceNames.join(',')}'`)

          const serviceCheck = () => {
            const count = serviceNames.filter(serviceName => registry.hasService(serviceName))

            log.warn(`${count.length} services of ${serviceNames.length} available. Waiting...`)

            if (count.length === serviceNames.length) {
              return resolve()
            }

            if (timeout && (Date.now() - startTimestamp) > timeout) {
              return reject(new WeaveError('The waiting of the services is interrupted due to a timeout.', 500, 'WAIT_FOR_SERVICE', { services: serviceNames }))
            }

            options.waitForServiceInterval = setTimeout(serviceCheck, interval)
          }

          serviceCheck()
        })
      },
      /**
       * Watch a Service object for changes.
       * @param {Service} service Service object
       * @return {void}
      */
      watchService: (service) => {
        if (service.filename && onServiceFileChanged) {
          // Create debounced service changed reference
          const debouncedOnServiceChange = debounce(onServiceFileChanged, 500)

          // Watch file changes
          const watcher = fs.watch(service.filename, (eventType, filename) => {
            log.info(`The Service ${service.name} has been changed. (${eventType}, ${filename})`)
            watcher.close()
            debouncedOnServiceChange(service)
          })
        }
      },
      destroyService
    }
  })
}
