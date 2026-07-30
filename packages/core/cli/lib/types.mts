import type { BrokerOptions } from "@weave-js/core/types/index.js";

/** Options a `create` command was invoked with. */
export interface CreateCommandOptions {
  /** Suffix of the generated file name - defaults to the template type. */
  suffix?: string;
  [key: string]: unknown;
}

/** Flags the `start` command was invoked with. */
export interface StartCommandFlags {
  /** Path to a config file. */
  config?: string;
  /** Path to a .env file - `true` falls back to `.env` in the working directory. */
  dotenv?: string | boolean;
  /** Comma separated list of service paths. */
  services?: string;
  /** Path to a service factory. */
  factory?: string;
  /** Start the REPL after the broker is up. */
  repl?: boolean;
  /** Restart services when a watched file changes. */
  watch?: boolean;
  /** Suppress console output. */
  silent?: boolean;
  [key: string]: unknown;
}

/** The broker configuration as it is read from a config file. */
export type WeaveConfig = Partial<BrokerOptions> & Record<string, unknown>;

/** A service instance as the watcher sees it. */
export interface WatchedService {
  filename?: string;
  fullyQualifiedName: string;
  name: string;
  version?: string | number;
  [key: string]: unknown;
}

/**
 * A CommonJS module record as it appears in `require.cache` - the watcher walks
 * the dependency tree through it.
 */
export interface ModuleRecord {
  filename: string;
  children?: ModuleRecord[];
  [key: string]: unknown;
}

/** The parts of the runtime the watch middleware uses. */
export interface WatchRuntime {
  state: { isStarted: boolean; [key: string]: unknown };
  broker: { loadService(filename: string): Promise<unknown>; [key: string]: unknown };
  services: {
    serviceList: WatchedService[];
    destroyService(service: WatchedService): Promise<unknown>;
    [key: string]: unknown;
  };
  log: {
    info(message: string): void;
    debug(message: string): void;
    warn(message: string): void;
    error(message: string, error?: unknown): void;
  };
  [key: string]: unknown;
}

/** The CLI object handed to the watch middleware. */
export interface WeaveCli {
  restartBroker?: () => Promise<void>;
  [key: string]: unknown;
}
