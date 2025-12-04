import kleur from "kleur";
import createSpinner from "./create-spinner.mts";

export function tableHeaderText(text: string): string {
  return kleur.bold(text);
}

export function successLabel(text: string): string {
  return kleur.bgGreen().black(text);
}

export function failureLabel(text: string): string {
  return kleur.bgRed().white(text);
}

export function infoLabel(text: string): string {
  return kleur.bgYellow().white(text);
}

export function text(text: string): string {
  return kleur.white(text);
}

export function highlightedText(text: string): string {
  return kleur.bold(text);
}

export function infoText(text: string): string {
  return kleur.blue(text);
}

export function successText(text: string): string {
  return kleur.green(text);
}

export function neutralText(text: string): string {
  return kleur.gray(text);
}

export function whiteText(text: string): string {
  return kleur.white(text);
}

export function warningText(text: string): string {
  return kleur.yellow(text);
}

export function errorText(text: string): string {
  return kleur.red(text);
}

export function printHeader(name: string, length: number = 30): void {
  const lines = "-".repeat(length);
  console.log(" ");
  console.log(kleur.red(lines));
  console.log(kleur.red().bold("| " + name));
  console.log(kleur.red(lines));
  console.log(" ");
}

export function printIntended(caption: string, value?: any): void {
  console.log(" ", caption.padEnd(25, " ") + (value != null ? ": " + kleur.bold(value) : ""));
}

export { createSpinner };
