/*
 * Author: Kevin Ries (kevin.ries@fachwerk.io)
 * -----
 * Copyright 2024 Fachwerk
 */

import { createBroker, TransportAdapters } from "@weave-js/core";
import repl from "@weave-js/repl";
import inquirer from "inquirer";
import kleur from "kleur";
import os from "os";
import { spawn } from "child_process";

interface ConnectArgs {
  transport?: string;
  uri?: string;
  host?: string;
  port?: string;
  password?: string;
  options?: string;
  nodeId?: string;
  namespace?: string;
  silent?: boolean;
  repl?: boolean;
}

type TransportFactory = (options?: Record<string, unknown>) => unknown;

/**
 * Install an npm package
 */
async function installPackage(packageName: string): Promise<void> {
  console.log(kleur.cyan(`Installing ${packageName}...`));

  return new Promise((resolve, reject) => {
    const child = spawn("npm", ["install", packageName], {
      stdio: "inherit",
      shell: true,
    });

    child.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`npm install failed with code ${code}`));
      }
    });

    child.on("error", (error) => {
      reject(error);
    });
  });
}

/**
 * Load an external transport adapter from an npm package
 */
async function loadExternalTransport(
  packageName: string,
  options: Record<string, unknown>,
): Promise<unknown> {
  try {
    const module = await import(packageName);
    const factory = module.default || module;

    if (typeof factory !== "function") {
      throw new Error(
        `Transport "${packageName}" does not export a valid factory function.\n` +
          `Expected: default export as a function that returns a transport adapter.`,
      );
    }

    return (factory as TransportFactory)(options);
  } catch (error) {
    const nodeError = error as NodeJS.ErrnoException;

    if (nodeError.code === "ERR_MODULE_NOT_FOUND" || nodeError.code === "MODULE_NOT_FOUND") {
      // Ask user if they want to install the package
      const { shouldInstall } = await inquirer.prompt([
        {
          type: "confirm",
          name: "shouldInstall",
          message: `Transport "${packageName}" is not installed. Install now?`,
          default: false,
        },
      ]);

      if (shouldInstall) {
        await installPackage(packageName);

        // Retry import after installation
        const module = await import(packageName);
        const factory = module.default || module;

        if (typeof factory !== "function") {
          throw new Error(`Transport "${packageName}" does not export a valid factory function.`);
        }

        return (factory as TransportFactory)(options);
      }

      throw new Error(`Transport "${packageName}" is required but not installed.`);
    }

    throw error;
  }
}

/**
 * Build transport options from CLI arguments
 */
function buildTransportOptions(args: ConnectArgs): Record<string, unknown> {
  let options: Record<string, unknown> = {};

  // Parse JSON options first
  if (args.options) {
    try {
      options = JSON.parse(args.options);
    } catch (error) {
      throw new Error(`Invalid JSON in --options: ${(error as Error).message}`);
    }
  }

  // CLI flags override JSON options
  if (args.host !== undefined) {
    options.host = args.host;
  }
  if (args.port !== undefined) {
    options.port = parseInt(args.port, 10);
  }
  if (args.password !== undefined) {
    options.password = args.password;
  }

  return options;
}

/**
 * Resolve transport adapter from arguments
 */
async function resolveTransport(args: ConnectArgs): Promise<unknown> {
  // 1. URI-Format
  if (args.uri) {
    return TransportAdapters.fromURI(args.uri);
  }

  if (!args.transport) {
    throw new Error("Either --transport or --uri must be specified.");
  }

  const transportOptions = buildTransportOptions(args);

  // 2. Check for built-in adapters (TCP, Dummy)
  // Map lowercase names to actual export names
  const builtinAdapters: Record<string, string> = {
    tcp: "TCP",
    dummy: "Dummy",
  };
  const normalizedName = args.transport.toLowerCase();
  const adapterKey = builtinAdapters[normalizedName];

  if (adapterKey) {
    const adapterFactory = (TransportAdapters as Record<string, TransportFactory>)[adapterKey];

    if (typeof adapterFactory === "function") {
      return adapterFactory(transportOptions);
    }
  }

  // 3. External npm package
  return await loadExternalTransport(args.transport, transportOptions);
}

/**
 * Connect command handler
 */
export const handler = async (args: ConnectArgs): Promise<void> => {
  // Validate arguments
  if (!args.transport && !args.uri) {
    console.error(kleur.red("Error: Either --transport or --uri must be specified."));
    console.error(kleur.yellow("\nUsage:"));
    console.error("  weave connect --transport tcp");
    console.error("  weave connect --transport @weave-js/redis-transport --host localhost");
    console.error("  weave connect --uri tcp://localhost:4000");
    process.exit(1);
  }

  try {
    // Display connection info
    if (args.uri) {
      console.log(kleur.cyan(`Connecting via URI: ${args.uri}`));
    } else {
      console.log(kleur.cyan(`Loading transport: ${args.transport}`));
    }

    // Resolve the transport adapter
    const adapter = await resolveTransport(args);

    // Generate node ID for the CLI client
    const nodeId = args.nodeId || `${os.hostname()}-${process.pid}-cli`;

    // Create broker configuration
    const brokerConfig = {
      nodeId,
      namespace: args.namespace || "",
      transport: {
        adapter,
      },
      logger: args.silent
        ? { enabled: false }
        : {
            enabled: true,
            level: "info" as const,
          },
    };

    console.log(kleur.cyan(`Connecting as node: ${nodeId}`));

    // Create and start the broker
    const broker = createBroker(brokerConfig);

    await broker.start();

    console.log(kleur.green("Connected to cluster successfully!"));

    // Start REPL if enabled (default: true)
    if (args.repl !== false) {
      console.log(kleur.gray("Type 'help' for available commands, 'q' to quit.\n"));
      repl(broker);
    } else {
      console.log(kleur.gray("Press Ctrl+C to disconnect.\n"));

      // Keep the process alive
      process.on("SIGINT", async () => {
        console.log(kleur.yellow("\nDisconnecting..."));
        await broker.stop();
        process.exit(0);
      });

      process.on("SIGTERM", async () => {
        await broker.stop();
        process.exit(0);
      });
    }
  } catch (error) {
    console.error(kleur.red(`Error: ${(error as Error).message}`));
    process.exit(1);
  }
};
