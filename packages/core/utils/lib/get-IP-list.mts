import os from "node:os";

/**
 * Get a list of IPv4 addresses from all network interfaces.
 * @param skipInternal - Whether to skip internal/loopback addresses
 * @returns Array of IPv4 addresses
 * @example
 * getIpList(); // ['192.168.1.100', '10.0.0.5']
 * getIpList(false); // ['127.0.0.1', '192.168.1.100', '10.0.0.5']
 */
export function getIpList(skipInternal: boolean = true): string[] {
  const interfaces = os.networkInterfaces();
  return Object.keys(interfaces)
    .map((name) => {
      let IPs = interfaces[name]!.filter((networkInterface) => {
        const family = networkInterface.family;
        return family === "IPv4" || (family as unknown) === 4;
      });

      if (skipInternal) {
        IPs = IPs.filter((networkInterface) => !networkInterface.internal);
      }

      return IPs.map((networkInterface) => networkInterface.address);
    })
    .flat();
}
