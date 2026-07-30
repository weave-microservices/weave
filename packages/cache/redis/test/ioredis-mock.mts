import { EventEmitter } from "events";
import { mock } from "node:test";

interface PipelineCommand {
  command: string;
  key: string;
}

export interface RedisMock {
  /** Options the client was constructed with. */
  options?: unknown;
  quitCalls: number;
  /** Key/value store backing get, set and setex. */
  store: Map<string, string>;
  /** Expiries set via setex, in seconds. */
  expiries: Map<string, number>;
  /** Commands executed through a pipeline. */
  pipelineCommands: PipelineCommand[];
  /** Emits a client event (connect, error, close). */
  emit: (event: string, ...args: unknown[]) => void;
  /** Batches the scan stream yields - defaults to all keys in one batch. */
  scanBatches?: string[][];
  /** Makes the scan stream fail instead of yielding data. */
  scanError?: Error;
  /** Makes pipeline.exec() reject. */
  pipelineError?: Error;
}

const createRedisMock = () => {
  const client = new EventEmitter();

  const state: RedisMock = {
    quitCalls: 0,
    store: new Map(),
    expiries: new Map(),
    pipelineCommands: [],
    emit: (event: string, ...args: unknown[]) => client.emit(event, ...args),
  };

  const scanStream = ({ match }: { match: string }) => {
    const stream = new EventEmitter();

    // The stream emits asynchronously, just like the real one.
    setImmediate(() => {
      if (state.scanError) {
        stream.emit("error", state.scanError);
        return;
      }

      const keys = [...state.store.keys()].filter(
        (key) => match === "*" || key.startsWith(match.replace("*", "")),
      );

      const batches = state.scanBatches ?? [keys];

      batches.forEach((batch) => stream.emit("data", batch));
      stream.emit("end");
    });

    return stream;
  };

  const pipeline = () => {
    const commands: PipelineCommand[] = [];

    return {
      del(key: string) {
        commands.push({ command: "del", key });
        return this;
      },
      async exec() {
        if (state.pipelineError) {
          throw state.pipelineError;
        }

        commands.forEach(({ key }) => state.store.delete(key));
        state.pipelineCommands.push(...commands);

        return commands.map(() => [null, 1]);
      },
    };
  };

  Object.assign(client, {
    async get(key: string) {
      return state.store.get(key) ?? null;
    },
    async set(key: string, value: string) {
      state.store.set(key, value);
      return "OK";
    },
    async setex(key: string, seconds: number, value: string) {
      state.store.set(key, value);
      state.expiries.set(key, seconds);
      return "OK";
    },
    async del(key: string) {
      return state.store.delete(key) ? 1 : 0;
    },
    async quit() {
      state.quitCalls++;
      return "OK";
    },
    scanStream,
    pipeline,
  });

  class RedisClientMock {
    constructor(options: unknown) {
      state.options = options;
      return client as unknown as RedisClientMock;
    }
  }

  return { state, RedisClientMock };
};

let current = createRedisMock();

/**
 * Registers the module mock for the `ioredis` package. Must be called once
 * before the cache adapter is imported; use the returned `reset` function to get
 * a fresh client state per test.
 */
export const installRedisMock = (): { reset: () => RedisMock } => {
  mock.module("ioredis", {
    defaultExport: function Redis(options: unknown) {
      return new current.RedisClientMock(options);
    },
  });

  return {
    reset: () => {
      current = createRedisMock();
      return current.state;
    },
  };
};
