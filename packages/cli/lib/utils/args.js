const camelize = (str) => {
  return str.replace(/-(\w)/g, (_, c) => c ? c.toUpperCase() : '')
}

exports.cleanArgs = (command) => {
  const args = {}
  command.options.forEach(o => {
    const key = camelize(o.long.replace(/^--/, ''))
    // if an option is not present and Command has a method with the same name
    // it should not be copied
    if (typeof command[key] !== 'function' && typeof command[key] !== 'undefined') {
      args[key] = command[key]
    }
  })
  return args
}
