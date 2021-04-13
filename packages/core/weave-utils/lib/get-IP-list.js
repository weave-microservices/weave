const os = require('os')

exports.getIpList = function getIpList (skipInternal = true) {
  const interfaces = os.networkInterfaces()
  return Object.keys(interfaces)
    .map(name => {
      let IPs = interfaces[name]
        .filter(int => int.family === 'IPv4')

      if (skipInternal) {
        IPs = IPs.filter(int => !int.internal)
      }

      return IPs.map(int => int.address)
    }).reduce((a, b) => a.concat(b), [])
}
