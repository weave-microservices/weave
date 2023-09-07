import { NetworkInterfaceInfo, networkInterfaces } from 'os';

export function getIpList (skipInternal = true): string[] {
  const interfaces = networkInterfaces();

  return Object.keys(interfaces)
    .map(name => interfaces[name] as NetworkInterfaceInfo | undefined)
    .filter((networkInterface) => networkInterface?.family === 'IPv4')
    .filter((networkInterface) => {
      if (skipInternal) {
        return !networkInterface?.internal;
      }
      return true;
    })
    .map((networkInterface) => {
      return networkInterface?.address;
    });
};
