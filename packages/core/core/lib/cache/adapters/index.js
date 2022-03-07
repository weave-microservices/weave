/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2021 Fachwerk
 */

module.exports = {
  ...require('./base'),
  ...require('./inMemory'),
  ...require('./inMemoryLru')
}

// exports.resolve = (cacheOptions) => {
//   const getByName = name => {
//     if (!name) {
//       return null
//     }

//     const n = Object
//       .keys(adapters)
//       .find(n => n.toLowerCase() === name.toLowerCase())

//     if (n) {
//       return adapters[n]
//     }
//   }

//   let cacheFactory

//   if (cacheOptions === true) {
//     cacheFactory = this.adapters.Memory
//   } else if (isString(cacheOptions)) {
//     const cache = getByName(cacheOptions)

//     if (cache) {
//       cacheFactory = cache()
//     } else {
//       throw new WeaveBrokerOptionsError(`Unknown cache type "${cacheOptions}"`)
//     }
//   } else if (isFunction(cacheOptions)) {
//     cacheFactory = cacheOptions
//   }
//   if (cacheFactory) {
//     return cacheFactory
//   }
// }
