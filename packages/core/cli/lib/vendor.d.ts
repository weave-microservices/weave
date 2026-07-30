/**
 * Ambient declarations for the untyped dependencies of the CLI.
 */

declare module "ejs" {
  /** Renders a template file and hands the result to the callback. */
  export function renderFile(
    path: string,
    data: Record<string, unknown>,
    options: unknown,
    callback: (error: Error | null, result?: string) => void,
  ): void;

  const ejs: {
    renderFile: typeof renderFile;
  };

  export default ejs;
}

declare module "update-notifier" {
  interface UpdateNotifier {
    notify(options?: { defer?: boolean; isGlobal?: boolean }): void;
  }

  export default function updateNotifier(options: {
    pkg: { name: string; version: string };
  }): UpdateNotifier;
}

declare module "user-home" {
  /** Absolute path of the home directory of the current user. */
  const home: string;

  export default home;
}
