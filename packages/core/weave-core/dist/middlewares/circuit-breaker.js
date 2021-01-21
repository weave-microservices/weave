/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2020 Fachwerk
 */
module.exports = () => {
    const storage = new Map();
    let log = null;
    let circuitBreakerTimer = null;
    function createWindowTimer(windowTime) {
        circuitBreakerTimer = setInterval(() => clearEndpointStore(), windowTime);
        circuitBreakerTimer.unref();
    }
    function clearEndpointStore() {
        storage.forEach(item => {
            if (item.callCounter === 0) {
                storage.delete(item.name);
                return;
            }
            item.callCounter = 0;
            item.failureCouter = 0;
        });
    }
    function getEndpointState(endpoint, options) {
        let item = storage.get(endpoint.name);
        if (!item) {
            item = {
                endpoint,
                options,
                callCounter: 0,
                failureCouter: 0,
                state: 'CIRCUIT_BREAKER_CLOSED',
                circuitBreakerTimer: null
            };
            storage.set(endpoint.name, item);
        }
        return item;
    }
    function success(item, options) {
        item.callCounter++;
        if (item.state === 'CIRCUIT_BREAKER_HALF_OPENED') {
            // @ts-expect-error ts-migrate(2554) FIXME: Expected 1 arguments, but got 2.
            closeCircuitBreaker(item, options);
        }
        else {
            checkThreshold(item, options);
        }
    }
    function failure(item, error, options) {
        item.callCounter++;
        item.failureCouter++;
        checkThreshold(item, options);
    }
    function checkThreshold(item, options) {
        if (item.failureCouter >= options.maxFailures) {
            openCircuitBreaker(item);
        }
    }
    function openCircuitBreaker(item) {
        item.state = 'CIRCUIT_BREAKER_OPEN';
        item.endpoint.state = false;
        item.circuitBreakerTimer = setTimeout(() => halfOpenCircuitBreaker(item), item.options.halfOpenTimeout);
        log.debug(`Circuit breaker has been opened for endpoint '${item.endpoint.name}'`);
    }
    function halfOpenCircuitBreaker(item) {
        item.state = 'CIRCUIT_BREAKER_HALF_OPEN';
        item.endpoint.state = true;
        log.debug(`Circuit breaker has been half opened for endpoint '${item.endpoint.name}'`);
    }
    function closeCircuitBreaker(item) {
        item.failureCouter = 0;
        item.callCounter = 0;
        item.state = 'CIRCUIT_BREAKER_CLOSED';
        item.endpoint.state = true;
        if (item.circuitBreakerTimer) {
            clearTimeout(item.circuitBreakerTimer);
            item.circuitBreakerTimer = null;
        }
        log.debug(`Circuit breaker has been closed for endpoint '${item.endpoint.name}'`);
    }
    function wrapCircuitBreakerMiddleware(handler, action) {
        const self = this;
        const options = Object.assign({}, self.options.circuitBreaker, action.circuitBreaker || {});
        if (options.enabled) {
            return function curcuitBreakerMiddleware(context) {
                const endpoint = context.endpoint;
                const item = getEndpointState(endpoint, options);
                return handler(context)
                    .then(result => {
                    const item = getEndpointState(endpoint, options);
                    success(item, options);
                    return result;
                })
                    .catch(error => {
                    failure(item, error, options);
                    return Promise.reject(error);
                });
            };
        }
        return handler;
    }
    return {
        created() {
            log = this.createLogger('circuit-breaker');
        },
        started() {
            const { enabled, windowTime } = this.options.circuitBreaker;
            if (enabled) {
                createWindowTimer(windowTime);
            }
        },
        localAction: wrapCircuitBreakerMiddleware,
        remoteAction: wrapCircuitBreakerMiddleware,
        brokerStopped() {
            clearInterval(circuitBreakerTimer);
        }
    };
};
