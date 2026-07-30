import os from "os";

interface NetworkAddressInfo {
  address: string;
  netmask: string;
}

function getBroadcastAddress({ address, netmask }: NetworkAddressInfo): string {
  const addressBytes = address.split(".").map(Number);
  const netmaskBytes = netmask.split(".").map(Number);
  const subnetBytes = netmaskBytes.map(
    (_: number, index: number) => addressBytes[index] & netmaskBytes[index],
  );
  const broadcastBytes = netmaskBytes.map(
    (_: number, index: number) => subnetBytes[index] | (~netmaskBytes[index] + 256),
  );
  return broadcastBytes.map(String).join(".");
}

export const getBroadcastAddresses = (): string[] => {
  const list: string[] = [];
  const interfaces = os.networkInterfaces();
  for (const iface in interfaces) {
    const ifaceList = interfaces[iface];
    if (ifaceList) {
      for (let i = 0; i < ifaceList.length; i++) {
        const f = ifaceList[i];
        if (f.family === "IPv4") {
          list.push(getBroadcastAddress(f));
        }
      }
    }
  }
  return list;
};
