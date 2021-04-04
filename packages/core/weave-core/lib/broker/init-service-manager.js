const { WeaveError } = require('../errors')
const { debounce } = require('@weave-js/utils')
const fs = require('fs')

exports.initServiceManager = (runtime) => {
  const { options, log, eventBus, transport, state, registry } = runtime

  const serviceList = []

  Object.defineProperty(runtime, 'services', {
    value: {
      serviceList,
      serviceChanged (isLocalService) {
        // Send local notification.
        eventBus.broadcastLocal('$services.changed', { isLocalService })

        // If the service is a local service - send current node informations to other nodes
        if (state.isStarted && isLocalService && transport) {
          transport.sendNodeInfo()
        }
      },
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
      serviceWatcher: (service, onServiceFileChanged) => {
        if (service.filename && onServiceFileChanged) {
          // Create debounced service changed reference
          const debouncedOnServiceChange = debounce(onServiceFileChanged, 500)

          // Watch file changes
          const watcher = fs.watch(service.filename, (eventType, filename) => {
            log.info(`The Service ${service.name} has been changed. (${eventType}, ${filename}) `)
            watcher.close()
            debouncedOnServiceChange(this, service)
          })
        }
      }
    }
  })
}
