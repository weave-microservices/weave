/**
 * Converts the string values vorpal collects on the command line into their
 * boolean counterparts, recursively.
 */
export default function convertArgs(args: Record<string, unknown>): Record<string, unknown> {
  const res: Record<string, unknown> = {};

  Object.keys(args).forEach((key) => {
    const value = args[key];
    if (Array.isArray(value)) {
      res[key] = value;
    } else if (typeof value === "object" && value !== null) {
      res[key] = convertArgs(value as Record<string, unknown>);
    } else if (value === "true") {
      res[key] = true;
    } else if (value === "false") {
      res[key] = false;
    } else {
      res[key] = value;
    }
  });

  return res;
}
