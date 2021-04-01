const { WeaveError } = require('../errors')

exports.initServiceManager = (runtime) => {
  const { options, log, eventBus, transport, state, registry } = runtime

  Object.defineProperty(runtime, 'services', {
    value: {
      serviceList: [],
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
      }
    }
  })
}
