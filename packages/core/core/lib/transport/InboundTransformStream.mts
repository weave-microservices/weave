import { Transform, Writable } from "stream";
import type { TransformCallback, TransformOptions } from "stream";

interface BackpressureEventData {
  sender: string;
  requestId: string;
}

// Internal Node.js readable state interface (simplified)
interface ReadableStateInternal {
  pipes?: Writable | Writable[];
}

const pushWithBackpressure = (
  stream: InboundTransformStream,
  chunks: any,
  encoding?: BufferEncoding | ((err?: Error | null) => void),
  callback: ((err?: Error | null) => void) | null = null,
  $index: number = 0,
): InboundTransformStream => {
  if (!(stream instanceof Transform)) {
    throw new TypeError('Argument "stream" must be an instance of Duplex');
  }

  chunks = [].concat(chunks).filter((x: any) => x !== undefined);

  if (typeof encoding === "function") {
    callback = encoding;
    encoding = undefined;
  }

  if ($index >= chunks.length) {
    if (typeof callback === "function") {
      callback();
    }
    return stream;
  } else if (!stream.push(chunks[$index], ...[encoding].filter(Boolean) as BufferEncoding[])) {
    stream.emit("backpressure", {
      sender: stream.sender,
      requestId: stream.requestId,
    });

    // Access internal Node.js readable state (not officially typed)
    const readableState = (stream as any)._readableState as ReadableStateInternal | undefined;
    const pipes = readableState?.pipes;
    const pipedStreams: Writable[] = ([] as any[]).concat(pipes || stream).filter(Boolean);

    let listenerCalled = false;

    const drainListener = (): void => {
      stream.emit("resume_backpressure", {
        sender: stream.sender,
        requestId: stream.requestId,
      });

      if (listenerCalled) {
        return;
      }

      listenerCalled = true;

      for (const pipedStream of pipedStreams) {
        pipedStream.removeListener("drain", drainListener);
      }

      pushWithBackpressure(stream, chunks, encoding, callback, $index + 1);
    };

    for (const pipedStream of pipedStreams) {
      pipedStream.once("drain", drainListener);
    }

    return stream;
  }
  return pushWithBackpressure(stream, chunks, encoding, callback, $index + 1);
};

export class InboundTransformStream extends Transform {
  sender: string;
  requestId: string;
  $prevSeq: number;
  $pool: Map<number, any>;

  constructor(sender: string, requestId: string, options?: TransformOptions) {
    super(options);
    this.sender = sender;
    this.requestId = requestId;
    this.$prevSeq = -1;
    this.$pool = new Map();
  }

  _transform(chunk: any, encoding: BufferEncoding, callback: TransformCallback): void {
    pushWithBackpressure(this, chunk, encoding, callback);
  }

  _flush(callback: TransformCallback): void {
    callback();
  }
}
