const { createGauge } = require('./gauge')

exports.createCounter = (metricRegistry, obj) => {
  const base = createGauge(metricRegistry, obj)

  base.decrement = () => {
    throw new Error('Not allowed to decrement a counter')
  }

  return base
}
