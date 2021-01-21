export interface UdpDiscoverySerializer {
  encode(object: any): Buffer,
  decode(buffer: Buffer): any
}

export function createCodec (): UdpDiscoverySerializer {
  return {
    encode (object) {
      return Buffer.from(JSON.stringify(object))
    },
    decode (buffer) {
      return JSON.parse(buffer.toString())
    }
  }
}
