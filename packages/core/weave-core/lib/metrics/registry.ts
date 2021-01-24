import { Broker } from "../broker/broker"
import { MetricsOptions } from "../broker/default-options"
import { Logger } from "../logger"

const { isPlainObject } = require('@weave-js/utils')
const MetricTypes = require('./types')

export type MetricLabel = {
  [key:string]: any
}

export type MetricRegistrationObject = {
  type: string,
  name: string,
  description?: string,
  labels?: Array<MetricLabel>
}
export interface MetricRegistry {
  broker: Broker,
  options: any,
  log: Logger,
  init(): void,
  register(metricObject: MetricRegistrationObject): Metric,
  increment(name: string, labels: any, value: number, timestamp: number): void,
  decrement(name: string, labels: any, value: number, timestamp: number): void
  timer(name: string, labels, timestamp): void,
  getMetric(name: string): Metric,
  list(): any,
}

export interface Metric {
  set(...args): any
}

export function createMetricRegistry(broker: Broker, options: MetricsOptions): MetricRegistry {
  return {
    broker,
    options,
    log: broker.createLogger('Metrics'),
    init () {
      this.storage = new Map<string, Metric>()

      if (options.adapters) {
        if (!Array.isArray(options.adapters)) {
          broker.handleError(new Error('Metic adapter needs to be an Array'))
        }

        this.adapters = options.adapters.map(adapter => {
          adapter.init(this)
          return adapter
        })
      }

      this.log.debug('Metrics initialized.')
    },
    register (obj: MetricRegistrationObject) {
      if (!isPlainObject(obj)) {
        broker.handleError(new Error('Param needs to be an object.'))
      }

      if (!obj.type) {
        broker.handleError(new Error('Type is missing.'))
      }

      if (!obj.name) {
        broker.handleError(new Error('Name is missing.'))
      }

      const MetricType = MetricTypes.resolve(obj.type)

      if (!MetricType) {
        broker.handleError(new Error('Unknown metric type.'))
      }

      const type = new MetricType(this, obj)

      this.storage.set(obj.name, type)

      return type
    },
    increment (name, labels, value = 1, timestamp) {
      const item = this.storage.get(name)

      if (!item) {
        broker.handleError(new Error('Item not found.'))
      }

      item.increment(labels, value, timestamp)
    },
    decrement (name, labels, value = 1, timestamp) {
      const item = this.storage.get(name)

      if (!item) {
        broker.handleError(new Error('Item not found.'))
      }

      item.decrement(labels, value, timestamp)
    },
    timer (name, labels, timestamp) {
      // const item = this.storage.get(name)
      // if (item) {

      // }
      // item.observe(labels, value, timestamp)
    },
    getMetric (name) {
      const item = this.storage.get(name)

      if (!item) {
        broker.handleError(new Error('Item not found.'))
      }

      return item
    },
    list () {
      const results = []

      this.storage.forEach(metric => {
        results.push(metric.toObject())
      })

      return results
    }
  }
}
