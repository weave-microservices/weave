import type { Broker } from "@weave-js/core/types/index.js";

/**
 * @fileoverview Minimal typings for the parts of vorpal this REPL uses.
 * The package ships no types of its own.
 */

/** Arguments and options vorpal hands to a command action. */
export interface CommandArgs {
  options: Record<string, unknown>;
  [key: string]: unknown;
}

/** A command action handler - vorpal passes a callback to signal completion. */
export type CommandAction = (args: CommandArgs, done: () => void) => void | Promise<void>;

/** Autocomplete definition of a command. */
export interface AutocompleteDefinition {
  data: () => string[];
}

/** One command of the REPL - the calls are chainable. */
export interface VorpalCommand {
  alias(...aliases: string[]): VorpalCommand;
  option(flags: string, description?: string): VorpalCommand;
  autocomplete(definition: AutocompleteDefinition | string[]): VorpalCommand;
  allowUnknownOptions(): VorpalCommand;
  hidden(): VorpalCommand;
  action(handler: CommandAction): VorpalCommand;
  remove(): void;
}

/** The vorpal instance. */
export interface Vorpal {
  command(name: string, description?: string): VorpalCommand;
  delimiter(value: string): Vorpal;
  show(): Vorpal;
  find(name: string): VorpalCommand | undefined;
  log(...args: unknown[]): void;
  ui: {
    redraw: {
      done(): void;
    };
  };
}

/** The helpers used to render the REPL output. */
export type CliUI = typeof import("./utils/cli-ui.mts");

/** What each command module receives to register itself. */
export interface CommandContext {
  vorpal: Vorpal;
  broker: Broker;
  cliUI: CliUI;
}

/** A command module registers itself on the vorpal instance. */
export type CommandRegistration = (context: CommandContext) => void;

/**
 * A node as the registry lists it.
 */
export interface RegistryNode {
  id: string;
  cpu: number | null;
  services?: Record<string, unknown>;
  client: { version: string; type: string };
  IPList: string[];
  isAvailable: boolean;
  [key: string]: unknown;
}

/** One node a service runs on, as shown in the services table. */
export interface ServiceNodeEntry {
  nodeId: string;
  isAvailable?: boolean;
}

/** A service aggregated over all nodes it runs on. */
export interface AggregatedService {
  name: string;
  version?: string | number;
  isPrivate?: boolean;
  isAvailable?: boolean;
  actions: number;
  events: number;
  nodes: ServiceNodeEntry[];
}

/** A service as the registry lists it. */
export interface RegistryService {
  name: string;
  version?: string | number;
  nodeId: string;
  actions?: Record<string, unknown>;
  events?: Record<string, unknown>;
  [key: string]: unknown;
}

/** An action or event as the registry lists it. */
export interface RegistryEntry {
  name: string;
  count?: number;
  hasLocal?: boolean;
  hasAvailable?: boolean;
  available?: boolean;
  action?: RegistryAction;
  [key: string]: unknown;
}

/** The action definition attached to a registry entry. */
export interface RegistryAction {
  name: string;
  cache?: boolean | Record<string, unknown>;
  params?: Record<string, unknown>;
  [key: string]: unknown;
}

/** One value of a metric, with its labels. */
export interface MetricValue {
  value: number | string;
  labels?: Record<string, unknown> | string;
}

/** A metric as the registry lists it. */
export interface MetricEntry {
  name: string;
  type: string;
  description?: string;
  value: MetricValue[];
}

/** Options accepted by the registry list calls. */
export interface RegistryListOptions {
  withActions?: boolean;
  withEvents?: boolean;
  withEndpoints?: boolean;
  withNodeService?: boolean;
  skipInternal?: boolean;
  onlyLocal?: boolean;
  onlyAvailable?: boolean;
  [key: string]: unknown;
}

/** The registry collections the REPL reads from. */
export interface ReplRegistry {
  nodeCollection: { list(options: RegistryListOptions): RegistryNode[] };
  serviceCollection: { list(options: RegistryListOptions): RegistryService[] };
  actionCollection: { list(options: RegistryListOptions): RegistryEntry[] };
  eventCollection: { list(options: RegistryListOptions): RegistryEntry[] };
}
