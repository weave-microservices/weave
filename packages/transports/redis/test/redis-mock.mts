import { mock } from "node:test";

export interface PublishedMessage {
  channel: string;
  message: string;
}

export interface SubscriptionMock {
  channel: string;
  /** Pushes a message into the subscription listener. */
  emit: (message: string) => void;
}

export interface ClientMock {
  options: unknown;
  isOpen: boolean;
  isReady: boolean;
  connectCalls: number;
  closeCalls: number;
  subscriptions: SubscriptionMock[];
  published: PublishedMessage[];
  /** Emits a client event (error, end, reconnecting, ready). */
  emit: (event: string, ...args: unknown[]) => void;
}

export interface RedisMock {
  /** All clients created via `createClient()` - SUB first, PUB second. */
  clients: ClientMock[];
  sub: ClientMock;
  pub: ClientMock;
  /** Makes the next `connect()` call reject with the given error. */
  failNextConnect: (error: Error) => void;
}

const createClientMock = (options: unknown, onConnect: () => Error | null): ClientMock => {
  const listeners = new Map<string, Array<(...args: unknown[]) => void>>();

  const client: ClientMock = {
    options,
    isOpen: false,
    isReady: false,
    connectCalls: 0,
    closeCalls: 0,
    subscriptions: [],
    published: [],
    emit: (event: string, ...args: unknown[]) => {
      for (const listener of listeners.get(event) ?? []) {
        listener(...args);
      }
    },
  };

  // The object handed to the adapter - the handles above stay writable for tests.
  return Object.assign(client, {
    on(event: string, listener: (...args: unknown[]) => void) {
      const existing = listeners.get(event) ?? [];
      listeners.set(event, [...existing, listener]);
      return client;
    },
    async connect() {
      client.connectCalls++;

      const error = onConnect();

      if (error) {
        throw error;
      }

      client.isOpen = true;
      client.isReady = true;
    },
    async subscribe(channel: string, listener: (message: string) => void) {
      client.subscriptions.push({ channel, emit: listener });
    },
    async publish(channel: string, message: string) {
      client.published.push({ channel, message });
    },
    async close() {
      client.closeCalls++;
      client.isOpen = false;
      client.isReady = false;
    },
  });
};

const createRedisMock = () => {
  const clients: ClientMock[] = [];
  let connectError: Error | null = null;

  const handles = {
    clients,
    get sub() {
      return clients[0];
    },
    get pub() {
      return clients[1];
    },
    failNextConnect: (error: Error) => {
      connectError = error;
    },
  } as RedisMock;

  const createClient = (options: unknown) => {
    const client = createClientMock(options, () => {
      const error = connectError;
      connectError = null;
      return error;
    });

    clients.push(client);
    return client;
  };

  return { handles, createClient };
};

let current = createRedisMock();

/**
 * Registers the module mock for the `redis` package. Must be called once before
 * the adapter is imported; use the returned `reset` function to get a fresh
 * client state per test.
 */
export const installRedisMock = (): { reset: () => RedisMock } => {
  mock.module("redis", {
    namedExports: {
      createClient: (options: unknown) => current.createClient(options),
    },
  });

  return {
    reset: () => {
      current = createRedisMock();
      return current.handles;
    },
  };
};
