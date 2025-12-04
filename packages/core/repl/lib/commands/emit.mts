import convertArgs from "../utils/convert-args.mts";

export default ({ vorpal, broker, cliUI }: any) => {
  vorpal
    .command("emit <eventName>", "Emit a event.")
    .autocomplete({
      data() {
        return [
          ...new Set(broker.runtime.registry.eventCollection.list({}).map((item) => item.name)),
        ];
      },
    })
    .allowUnknownOptions()
    .action((args: any, done: any) => {
      const payload = convertArgs(args.options);
      console.log(cliUI.infoText(`>> Emit '${args.eventName}' with payload:`), payload);
      broker.emit(args.eventName, payload);
      done();
    });
};
