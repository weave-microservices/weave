import Counter from './counter'
import Gauge from './gauge'
import Info from './info'

const types = {
  Counter,
  Gauge,
  Info
}

const getByName = (name) => {
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
