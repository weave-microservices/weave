import { mock } from "node:test";

export interface PublishedMessage {
  subject: string;
  payload: Uint8Array;
}

export interface SubscriptionMock {
  subject: string;
  /** Pushes a message into the subscription callback. */
  emit: (data: string) => void;
  /** Pushes an error into the subscription callback. */
  emitError: (error: Error) => void;
}

export interface NatsMock {
  /** Options the last `connect()` call was made with. */
  connectOptions: unknown;
  connectCalls: number;
  published: PublishedMessage[];
  subscriptions: SubscriptionMock[];
  drainCalls: number;
  /** Pushes a status event into the async status iterator of the connection. */
  pushStatus: (status: { type: string; data?: unknown }) => void;
  /** Marks the connection as closed by the server. */
  markClosed: () => void;
  /** Makes the next `connect()` call reject with the given error. */
  failNextConnect: (error: Error) => void;
  /** Ends the status stream so no watcher keeps the test runner alive. */
  dispose: () => void;
}

/**
 * Creates a push based async iterator used for the connection status stream.
 */
const createStatusStream = () => {
  const buffer: Array<{ type: string; data?: unknown }> = [];
  let notify: (() => void) | null = null;
  let done = false;

  const iterable: AsyncIterable<{ type: string; data?: unknown }> = {
    async *[Symbol.asyncIterator]() {
      while (!done || buffer.length) {
        if (buffer.length) {
          yield buffer.shift()!;
          continue;
        }

        await new Promise<void>((resolve) => {
          notify = () => {
            notify = null;
            resolve();
          };
        });
      }
    },
  };

  return {
    iterable,
    push: (status: { type: string; data?: unknown }) => {
      buffer.push(status);
      notify?.();
    },
    end: () => {
      done = true;
      notify?.();
    },
  };
};

/**
 * Creates a fresh mocked NATS connection together with its inspection handles.
 */
const createNatsMock = () => {
  const status = createStatusStream();
  let closed = false;
  let connectError: Error | null = null;

  const handles: NatsMock = {
    connectOptions: undefined,
    connectCalls: 0,
    published: [],
    subscriptions: [],
    drainCalls: 0,
    pushStatus: status.push,
    markClosed: () => {
      closed = true;
    },
    failNextConnect: (error: Error) => {
      connectError = error;
    },
    dispose: status.end,
  };

  const connection = {
    status: () => status.iterable,
    isClosed: () => closed,
    subscribe(
      subject: string,
      options: { callback: (error: Error | null, message: { data: Uint8Array }) => void },
    ) {
      const subscription: SubscriptionMock = {
        subject,
        emit: (data: string) => options.callback(null, { data: new Uint8Array(Buffer.from(data)) }),
        emitError: (error: Error) => options.callback(error, { data: new Uint8Array() }),
      };

      handles.subscriptions.push(subscription);
      return subscription;
    },
    publish(subject: string, payload: Uint8Array) {
      handles.published.push({ subject, payload });
    },
    async drain() {
      handles.drainCalls++;
      closed = true;
      status.end();
    },
  };

  const connect = async (options: unknown) => {
    handles.connectCalls++;
    handles.connectOptions = options;

    if (connectError) {
      const error = connectError;
      connectError = null;
      throw error;
    }

    return connection;
  };

  return { handles, connect };
};

let current = createNatsMock();

/**
 * Registers the module mock for the `nats` package. Must be called once before
 * the adapter is imported; use the returned `reset` function to get a fresh
 * connection state per test.
 */
export const installNatsMock = (): { reset: () => NatsMock } => {
  mock.module("nats", {
    namedExports: {
      connect: (options: unknown) => current.connect(options),
      Events: {
        Disconnect: "disconnect",
        Reconnect: "reconnect",
        Update: "update",
        LDM: "ldm",
        Error: "error",
      },
      DebugEvents: {
        Reconnecting: "reconnecting",
        PingTimer: "pingTimer",
        StaleConnection: "staleConnection",
        ClientInitiatedReconnect: "client initiated reconnect",
      },
    },
  });

  return {
    reset: () => {
      current.handles.dispose();
      current = createNatsMock();
      return current.handles;
    },
  };
};
