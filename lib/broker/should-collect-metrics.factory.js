/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2018 Fachwerk
 */

const shouldCollectMetricsFactory = ({ state, options }) =>
    () => {
        if (options.metrics) {
            state.actionCount++
            if (state.actionCount * options.metricsRate >= 1) {
                state.actionCount = 0
                return true
            }
            return false
        }
    }

module.exports = shouldCollectMetricsFactory
