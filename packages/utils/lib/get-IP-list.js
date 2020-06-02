const os = require('os')

module.exports.getIpList = function getIpList () {
  const list = []
  const interfaces = os.networkInterfaces()

  for (const iface in interfaces) {
    for (const i in interfaces[iface]) {
      const f = interfaces[iface][i]
      if (f.family === 'IPv4' && !f.internal) {
        list.push(f.address)
        break
      }
    }
  }

  return list
}
