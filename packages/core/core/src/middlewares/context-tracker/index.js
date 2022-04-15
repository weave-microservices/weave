const { WeaveGracefulStopTimeoutError } = require('../../errors');

module.exports = (runtime) => {
  function addContext (context) {
    if (context.service) {
      // local actions
      context.service._trackedContexts.push(context);
    } else {
      // remote actions
      context.service._trackedContexts.push(context);
    }
  }

  function removeContext (context) {
    if (context.service) {
      // local actions
      const index = context.service._trackedContexts.indexOf(context);
      if (index !== -1) {
        context.service._trackedContexts.splice(index, 1);
      }
    } else {
      const index = context.service._trackedContexts.indexOf(context);
      if (index !== -1) {
        context.service._trackedContexts.splice(index, 1);
      }
    }
  }

  function wrapContextTrackerMiddleware (actionHandler) {
    return function ContextTrackerMiddleware (context, serviceInjections) {
      const isTracked = context.options.track === true ? context.options.track : runtime.options.contextTracking.enabled;

      if (!isTracked) {
        return actionHandler(context, serviceInjections);
      }

      addContext(context);

      return actionHandler(context, serviceInjections)
        .then(result => {
          removeContext(context);
          return result;
        })
        .catch(error => {
          removeContext(context);
          throw error;
        });
    };
  }

  const waitingForActiveContexts = (contextList, log, shutdownTimeout, service) => {
    return new Promise((resolve) => {
      if (contextList.length === 0) {
        resolve();
      }

      let isTimedOut = false;
      const timeout = setTimeout(() => {
        isTimedOut = true;
        log.error(new WeaveGracefulStopTimeoutError(service));
        contextList = [];
        resolve();
      }, shutdownTimeout);

      let isFirstCheck = true;
      const checkContexts = () => {
        if (contextList.length === 0) {
          clearTimeout(timeout);
          resolve();
        } else {
          if (isFirstCheck) {
            log.info(`Waiting for ${contextList.length} open Contexts...`);
            isFirstCheck = false;
          }

          if (!isTimedOut) {
            setTimeout(checkContexts, 100);
          }
        }
      };
      setImmediate(checkContexts);
    });
  };

  return {
    created () {
      // init context-store
      runtime.state.trackedContexts = [];
    },
    serviceStarting (service) {
      service._trackedContexts = [];
    },

    // Before a local service stopping
    serviceStopping (service) {
      return waitingForActiveContexts(service._trackedContexts, service.log, service.settings.$shutdownTimeout || service.broker.options.contextTracking.shutdownTimeout, service);
    },

    // Before broker stopping
    stopping () {
      return waitingForActiveContexts(runtime.state.trackedContexts, runtime.log, runtime.options.contextTracking.shutdownTimeout);
    },
    localAction: wrapContextTrackerMiddleware,
    remoteAction: wrapContextTrackerMiddleware,
    localEvent: wrapContextTrackerMiddleware
  };
};
