import { getRegistry } from "../helper/registry.mts";
import type { AggregatedService, CommandArgs, CommandContext, RegistryService } from "../types.mts";
import pkg from "table";
const { table } = pkg;

export default ({ vorpal, broker, cliUI }: CommandContext) => {
  vorpal.command("services", "List services").action((args: CommandArgs, done: () => void) => {
    const data = [];
    data.push([
      cliUI.tableHeaderText("Service"),
      cliUI.tableHeaderText("Version"),
      cliUI.tableHeaderText("Visibility"),
      cliUI.tableHeaderText("State"),
      cliUI.tableHeaderText("Actions"),
      cliUI.tableHeaderText("Events"),
      cliUI.tableHeaderText("Nodes"),
    ]);

    const list: AggregatedService[] = [];
    const services = getRegistry(broker).serviceCollection.list({
      withActions: true,
      withEvents: true,
      withNodeService: true,
      withPrivate: true,
    });

    services.map((service: RegistryService) => {
      const existingItem = list.find(
        (entry) => entry.name === service.name && entry.version === service.version,
      );

      if (existingItem) {
        existingItem.nodes.push({
          nodeId: service.nodeId,
          isAvailable: service.isAvailable as boolean | undefined,
        });
      } else {
        const item: AggregatedService = {
          name: service.name,
          version: service.version,
          isPrivate: service.isPrivate as boolean | undefined,
          isAvailable: service.isAvailable as boolean | undefined,
          actions: service.actions ? Object.keys(service.actions).length : 0,
          events: service.events ? Object.keys(service.events).length : 0,
          nodes: [
            {
              nodeId: service.nodeId,
              isAvailable: service.isAvailable as boolean | undefined,
            },
          ],
        };
        list.push(item);
      }
    });

    list.map((service) => {
      data.push([
        service.name,
        service.version ? String(service.version) : "-",
        service.isPrivate ? cliUI.failureLabel(" PRIVATE ") : cliUI.successLabel(" PUBLIC "),
        service.isAvailable ? cliUI.successLabel("  OK  ") : cliUI.failureLabel(" FAILURE "),
        String(service.actions),
        String(service.events),
        String(service.nodes.length),
      ]);
    });

    const tableConf = {};

    console.log(table(data, tableConf));
    done();
  });
};
