import { getRegistry } from "../helper/registry.mts";
import type { CommandArgs, CommandContext, RegistryNode } from "../types.mts";
import pkg from "table";
const { table } = pkg;

export default ({ vorpal, broker, cliUI }: CommandContext) => {
  vorpal.command("nodes", "List connected nodes").action((args: CommandArgs, done: () => void) => {
    const data = [];
    data.push([
      cliUI.tableHeaderText("Node ID"),
      cliUI.tableHeaderText("Services"),
      cliUI.tableHeaderText("Version"),
      cliUI.tableHeaderText("Client"),
      cliUI.tableHeaderText("IP"),
      cliUI.tableHeaderText("State"),
      cliUI.tableHeaderText("CPU"),
    ]);

    const nodes = getRegistry(broker).nodeCollection.list({});

    nodes.map((node: RegistryNode) => {
      let cpuLoad = "?";
      if (node.cpu !== null) {
        const width = 20;
        const c = Math.round(node.cpu / (100 / width));
        cpuLoad = ["["]
          .concat(Array(c).fill("■"), Array(width - c).fill("."), ["] ", node.cpu.toFixed(0), "%"])
          .join("");
      }

      data.push([
        node.id === broker.runtime.nodeId ? `${node.id}(*)` : node.id,
        node.services ? Object.keys(node.services).length : 0,
        node.client.version,
        node.client.type,
        node.IPList[0],
        node.isAvailable ? cliUI.successLabel(" ONLINE ") : cliUI.failureLabel(" OFFLINE "),
        cpuLoad,
      ]);
    });
    const tableConf = {};

    console.log(table(data, tableConf));
    done();
  });
};
