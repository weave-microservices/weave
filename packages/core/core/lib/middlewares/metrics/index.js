/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2021 Fachwerk
 */
const { Constants } = require('../../metrics');
const { getMiddlewareWrapper } = require('./getMiddlewareWrapper');

module.exports = (runtime) => {
  const wrapMetricMiddleware = getMiddlewareWrapper(runtime);

  return {
    created () {
      // Request metrics
      runtime.metrics.register({ type: 'counter', name: Constants.REQUESTS_TOTAL, description: 'Number of total requests.' });
      runtime.metrics.register({ type: 'gauge', name: Constants.REQUESTS_IN_FLIGHT, description: 'Number of running requests.' });
      runtime.metrics.register({ type: 'counter', name: Constants.REQUESTS_ERRORS_TOTAL, description: 'Number of failed requests.' });
      runtime.metrics.register({ type: 'gauge', name: Constants.REQUESTS_TIME, description: 'Request times in milliseconds' });

      // Event metrics
      runtime.metrics.register({ type: 'counter', name: Constants.EVENT_TOTAL_EMITS, description: 'Number of total emitted events.' });
      runtime.metrics.register({ type: 'counter', name: Constants.EVENT_TOTAL_BROADCASTS, description: 'Number of total broadcasted events.' });
      runtime.metrics.register({ type: 'counter', name: Constants.EVENT_TOTAL_BROADCASTS_LOCAL, description: 'Number of total local broadcasted events.' });
      runtime.metrics.register({ type: 'counter', name: Constants.EVENT_TOTAL_RECEIVED, description: 'Number of total received events.' });

      // Transport metrics
      runtime.metrics.register({ type: 'gauge', name: Constants.TRANSPORT_IN_FLIGHT_STREAMS, description: 'Number of in flight streams.' });
      runtime.metrics.register({ type: 'counter', name: Constants.TRANSPORTER_PACKETS_SENT, description: 'Number of in flight streams.' });
      runtime.metrics.register({ type: 'counter', name: Constants.TRANSPORTER_PACKETS_RECEIVED, description: 'Number of in flight streams.' });
      runtime.metrics.register({ type: 'gauge', name: Constants.TRANSPORT_IN_FLIGHT_STREAMS, description: 'Number of in flight streams.' });
    },
    localAction (next, action) {
      return wrapMetricMiddleware('local', action, next);
    },
    remoteAction (next, action) {
      return wrapMetricMiddleware('remote', action, next);
    },
    emit (next) {
      return (event, payload) => {
        runtime.metrics.increment(Constants.EVENT_TOTAL_EMITS);
        return next(event, payload);
      };
    },
    broadcast (next) {
      return (event, payload) => {
        runtime.metrics.increment(Constants.EVENT_TOTAL_BROADCASTS);
        return next(event, payload);
      };
    },
    broadcastLocal (next) {
      return (event, payload) => {
        runtime.metrics.increment(Constants.EVENT_TOTAL_BROADCASTS_LOCAL);
        return next(event, payload);
      };
    }
  };
};
