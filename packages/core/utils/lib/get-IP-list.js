const os = require('os');

/**
 *
 * @param {boolean} skipInternal
 * @returns {string[]}
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
