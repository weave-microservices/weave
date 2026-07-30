import { Writable } from "stream";

export default class TestStream extends Writable {
  chunks: string[];

  constructor() {
    super();
    this.chunks = [];
  }

  _write(
    chunk: Buffer | string,
    encoding: BufferEncoding,
    done: (error?: Error | null) => void,
  ): void {
    const sanitizedString = chunk
      .toString()
      // eslint-disable-next-line no-control-regex -- ANSI escape sequences are control characters by definition
      .replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, "");
    this.chunks.push(sanitizedString);
    done();
  }

  getSnapshot(): string[] {
    return this.chunks;
  }
}
