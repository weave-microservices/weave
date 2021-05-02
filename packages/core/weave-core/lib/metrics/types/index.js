const types = {
  Counter: require('./counter').createCounter,
  Gauge: require('./gauge').createGauge,
  Info: require('./info').createInfo
}

const getByName = name => {
  const n = Object.keys(types).find(i => i.toLocaleLowerCase() === name.toLocaleLowerCase())

  if (n) {
    return types[n]
  }
}

module.exports = {
  resolve (type) {
    return getByName(type)
  }
}
