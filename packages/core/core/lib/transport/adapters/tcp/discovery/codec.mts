interface Codec {
  encode(object: any): Buffer;
  decode(buffer: Buffer): any;
}

export default function createCodec(_options: any): Codec {
  return {
    encode(object: any): Buffer {
      return Buffer.from(JSON.stringify(object));
    },
    decode(buffer: Buffer): any {
      return JSON.parse(buffer.toString());
    },
  };
}
