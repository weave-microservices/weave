import { getRegistry } from "../helper/registry.mts";
import type { CommandArgs, CommandContext } from "../types.mts";
import convertArgs from "../utils/convert-args.mts";

export default ({ vorpal, broker, cliUI }: CommandContext) => {
  vorpal
    .command("emit <eventName>", "Emit a event.")
    .autocomplete({
      data() {
        return [
          ...new Set(
            getRegistry(broker)
              .eventCollection.list({})
              .map((item) => item.name),
          ),
        ];
      },
    })
    .allowUnknownOptions()
    .action((args: CommandArgs, done: () => void) => {
      const payload = convertArgs(args.options);
      console.log(cliUI.infoText(`>> Emit '${args.eventName}' with payload:`), payload);
      broker.emit(String(args.eventName), payload);
      done();
    });
};
