const os = require('os');

/**
 * Get a list of IPv4 addresses from all network interfaces.
 * @param {boolean} [skipInternal=true] - Whether to skip internal/loopback addresses
 * @returns {string[]} Array of IPv4 addresses
 * @example
 * getIpList(); // ['192.168.1.100', '10.0.0.5']
 * getIpList(false); // ['127.0.0.1', '192.168.1.100', '10.0.0.5']
 */
exports.getIpList = function getIpList (skipInternal = true) {
  const interfaces = os.networkInterfaces();
  return Object.keys(interfaces)
    .map(name => {
      // @ts-ignore
      let IPs = interfaces[name]
        .filter((networkInterface) => networkInterface.family === 'IPv4' || networkInterface.family === 4);

      if (skipInternal) {
        IPs = IPs.filter((networkInterface) => !networkInterface.internal);
      }

      return IPs.map((networkInterface) => networkInterface.address);
    }).flat();
};
