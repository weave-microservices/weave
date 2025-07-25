/**
 * Metrics collection and monitoring system
 *
 * Provides standardized metrics collection for:
 * - Request/response times and counts
 * - Error rates and types
 * - Node performance metrics
 * - Custom application metrics
 * - System resource utilization
 *
 * Supports multiple metric types:
 * - Counters: Incrementing values (request counts, errors)
 * - Gauges: Current values (memory usage, active connections)
 * - Histograms: Value distributions (response times, payload sizes)
 * - Info: Static metadata (version, build info)
 *
 * @namespace Metrics
 */

/**
 * Metric constants and identifiers
 * @type {object}
 */
exports.Constants = require('./constants');

/**
 * Metric exporter implementations for different backends
 * @type {object}
 */
exports.Exporter = require('./exporter');
