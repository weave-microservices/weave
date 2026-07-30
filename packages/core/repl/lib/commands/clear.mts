import type { CommandArgs, CommandContext } from "../types.mts";
export default ({ vorpal }: CommandContext) => {
  vorpal
    .command("clear", "Clear console.")
    .alias("cc")
    .action((_: CommandArgs, done: () => void) => {
      process.stdout.write("\x1Bc");
      done();
    });
};
