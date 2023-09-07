const os = require('os');

function getBroadcastAddress ({ address, netmask }) {
  const addressBytes = address.split('.').map(Number);
  const netmaskBytes = netmask.split('.').map(Number);
  const subnetBytes = netmaskBytes.map(
    (_, index) => addressBytes[index] & netmaskBytes[index]
  );
  const broadcastBytes = netmaskBytes.map(
    (_, index) => subnetBytes[index] | (~netmaskBytes[index] + 256)
  );
  return broadcastBytes.map(String).join('.');
}

exports.getBroadcastAddresses = () => {
  const list = [];
  const interfaces = os.networkInterfaces();
  for (const iface in interfaces) {
    for (const i in interfaces[iface]) {
      const f = interfaces[iface][i];
      if (f.family === 'IPv4') {
        list.push(getBroadcastAddress(f));
      }
    }
  }
  return list;
};
