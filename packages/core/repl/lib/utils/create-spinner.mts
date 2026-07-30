import ora, { type Options } from "ora";

type SpinnerName = NonNullable<Options["spinner"]>;

export default function createSpinner(text: string, type: SpinnerName = "dots4") {
  return ora({
    text,
    spinner: type,
  });
}
