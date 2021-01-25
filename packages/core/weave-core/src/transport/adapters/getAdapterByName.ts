import * as adapters from './adapters'

export function getAdapterByName(name) {
  if (!name) {
    return
  }

  const foundAdapterName = Object.keys(adapters).find(adapter => adapter.toLowerCase() === name.toLowerCase())
  
  if (foundAdapterName) {
    return adapters[foundAdapterName]
  }
}
