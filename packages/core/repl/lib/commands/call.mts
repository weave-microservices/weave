import { getRegistry } from "../helper/registry.mts";
import type { CommandContext } from "../types.mts";
import invokeAction from "../helper/invoke-action.mts";

export default ({ vorpal, broker }: CommandContext) => {
  vorpal
    .command("call <actionName> [jsonParams]", "Call an action.")
    .alias("c")
    .option("-d, --data [filename]", "Load params from file")
    .option("-m, --metadata [filename]", "Load metadata from file")
    .option("--stream [filename]", "Send a file as stream")
    .option("-s, --save [filename]", "Save response to file")
    .autocomplete({
      data() {
        return [
          ...new Set(
            getRegistry(broker)
              .actionCollection.list({})
              .map((item) => item.name),
          ),
        ];
      },
    })
    .allowUnknownOptions()
    .action(invokeAction(broker));
};
