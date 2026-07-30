import { getRegistry } from "../helper/registry.mts";
import type { CommandArgs, CommandContext, RegistryEntry } from "../types.mts";
import pkg from "table";
import type { TableUserConfig } from "table";
const { table } = pkg;

export default ({ vorpal, broker, cliUI }: CommandContext) => {
  vorpal
    .command("events", "List registered events.")
    .action((args: CommandArgs, done: () => void) => {
      const tableConf: TableUserConfig & { spanningCells?: unknown[] } = {};
      const data = [];

      data.push([
        cliUI.tableHeaderText("Event"),
        cliUI.tableHeaderText("Group"),
        cliUI.tableHeaderText("State"),
        cliUI.tableHeaderText("Nodes"),
      ]);

      const events = getRegistry(broker).eventCollection.list({
        withEndpoints: true,
      });

      if (events.length === 0) {
        tableConf.spanningCells = [{ col: 0, row: 1, colSpan: 4, alignment: "center" }];

        data.push(["No events", "", "", ""]);
      } else {
        events.map((event: RegistryEntry) => {
          if (event) {
            data.push([
              event.name,
              event.groupName,
              event.hasAvailable ? cliUI.successLabel("  OK  ") : cliUI.failureLabel(" FAILURE "),
              event.count,
            ]);
          }
        });
      }

      console.log(table(data, tableConf));
      done();
    });
};
