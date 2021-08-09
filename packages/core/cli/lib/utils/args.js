const camelize = (str) => {
  return str.replace(/-(\w)/g, (_, c) => c ? c.toUpperCase() : '')
}

exports.cleanArgs = (options) => {
  const args = {}
  Object.keys(options).forEach(o => {
    const key = camelize(o.replace(/^--/, ''))
    // if an option is not present and Command has a method with the same name
    // it should not be copied
    if (typeof options[key] !== 'function' && typeof options[key] !== 'undefined') {
      args[key] = options[key]
    }
  })

  return args
}
