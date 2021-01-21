import adapters from './adapters'

module.exports = name => {
  if (!name) {
    return
  }
  const foundAdapterName = Object.keys(adapters).find(adapter => adapter.toLowerCase() === name.toLowerCase())
  if (foundAdapterName) {
    return adapters[foundAdapterName]
  }
}
