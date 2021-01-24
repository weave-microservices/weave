import { isFunction } from '@weave-js/utils'
import Event from './event'
import BaseCollector from './base'

const collectors = {
  Event,
  BaseCollector
}

const getByName = (name) => {
  const n = Object.keys(collectors).find(collectorName => collectorName.toLowerCase() === name.toLowerCase())
  return collectors[n]
}

export function resolveCollector(broker, collector, tracer) {
  let CollectorClass
  if (typeof collector === 'string') {
    CollectorClass = getByName(collector)
  }

  if (isFunction(collector) || typeof collector === 'object') {
    return collector
  }

  if (!CollectorClass) {
    broker.handleError(new Error('Tracer not found'))
  }

  return new CollectorClass(collector)
}

export { Event, BaseCollector }
