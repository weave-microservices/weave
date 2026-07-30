import { getRegistry } from "../helper/registry.mts";
import type { CommandArgs, CommandContext } from "../types.mts";
import pkg from "table";
const { table } = pkg;
type TableUserConfig = Parameters<typeof table>[1];

export default ({ vorpal, broker, cliUI }: CommandContext) => {
  vorpal
    .command("actions", "List actions")
    .option("-l, --local", "Show only local actions.")
    .action((args: CommandArgs, done: () => void) => {
      const tableConf: TableUserConfig & { spanningCells?: unknown[] } = {};
      const data: string[][] = [];

      data.push([
        "Action",
        cliUI.tableHeaderText("Nodes"),
        cliUI.tableHeaderText("State"),
        cliUI.tableHeaderText("Cached"),
        cliUI.tableHeaderText("Params"),
      ]);

      const listOptions = {
        withEndpoints: true,
        onlyLocals: !!args.options.local,
      };

      const actions = getRegistry(broker).actionCollection.list(listOptions);

      if (actions.length === 0) {
        tableConf.spanningCells = [{ col: 0, row: 1, colSpan: 5, alignment: "center" }];

        data.push(["No actions found", "", "", "", ""]);
      } else {
        actions.map((item) => {
          const action = item.action;
          const params = action && action.params ? Object.keys(action.params).join(", ") : "";

          if (action) {
            data.push([
              action.name,
              item.hasLocal ? `(*)${item.count}` : String(item.count),
              item.hasAvailable ? cliUI.successLabel("  OK  ") : cliUI.failureLabel(" FAILURE "),
              action.cache ? cliUI.successText("Yes") : cliUI.neutralText("No"),
              params,
            ]);
          }
        });
      }

      console.log(table(data, tableConf));

      done();
    });
};
