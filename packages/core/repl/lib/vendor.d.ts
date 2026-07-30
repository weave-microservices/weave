/**
 * Ambient declarations for the untyped CLI dependencies of the REPL.
 */

declare module "vorpal" {
  import type { Vorpal } from "./types.mts";

  const VorpalConstructor: new () => Vorpal;

  export default VorpalConstructor;
}

declare module "clui" {
  /** Renders a horizontal bar - used for the memory and heap display. */
  type Gauge = (
    value: number,
    maxValue: number,
    width: number,
    dangerZone?: number,
    suffix?: string,
  ) => string;

  const clui: {
    Gauge: Gauge;
  };

  export default clui;
}
