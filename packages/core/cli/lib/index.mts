#!/usr/bin/env node
import updateNotifier from "update-notifier";
import pkg from "../package.json" with { type: "json" };
import { program } from "commander";
import { cleanArgs } from "./utils/args.mts";
import * as startCommand from "./commands/start/index.mts";
import * as createCommand from "./commands/create/index.mts";
import * as connectCommand from "./commands/connect/index.mts";

updateNotifier({ pkg }).notify();

program.version(`@weave-js/cli ${pkg.version}`).usage("<command> [options]");

program
  .command("start")
  .description("Start a new weave broker instance")
  .option("-c, --config [configPath]", "Start broker with config file.")
  .option("-e, --dotenv [dotEnvPath]", "Load .env file.")
  .option("-s, --services <servicePath>", "Start broker with services loaded from the given path.")
  .option("-f --factory <factoryPath>", "Start broker with services loaded from the given factory.")
  .option("-r, --repl", "Start broker with REPL.")
  .option("-w, --watch", "Start broker with service watcher.")
  .option("-sl, --silent", "Start broker without console outputs.")
  .action((args) => {
    startCommand.handler(cleanArgs(args));
  });

program
  .command("create <type> <name>")
  .description("create a new project powered by vue-cli-service")
  .option("-t,--template <template>", "Start broker with config file.")
  .option("-s,--suffix <suffix>", "Service file suffix (default: service)")
  .action((type, name, options) => {
    createCommand.handler(type, name, options);
  });

program
  .command("connect")
  .description("Connect to an existing weave cluster and start a REPL session")
  .option("-t, --transport <adapter>", "Transport adapter (tcp, @weave-js/redis-transport, etc.)")
  .option("-u, --uri <uri>", "Transport URI (tcp://host:port, redis://...)")
  .option("-H, --host <host>", "Transport host address")
  .option("-p, --port <port>", "Transport port number")
  .option("-P, --password <password>", "Transport password")
  .option("-o, --options <json>", "Additional transport options as JSON")
  .option("-n, --nodeId <id>", "Custom node ID")
  .option("--namespace <ns>", "Namespace for multi-tenant setups")
  .option("--silent", "Disable log output")
  .option("--no-repl", "Don't start REPL after connecting")
  .action((args) => {
    connectCommand.handler(cleanArgs(args));
  });

program.parse(process.argv);
