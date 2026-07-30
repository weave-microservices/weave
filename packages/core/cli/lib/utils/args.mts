const camelize = (str: string): string => {
  return str.replace(/-(\w)/g, (_, c) => (c ? c.toUpperCase() : ""));
};

export const cleanArgs = (options: Record<string, unknown>): Record<string, unknown> => {
  const args: Record<string, unknown> = {};
  Object.keys(options).forEach((o) => {
    const camelizedKey = camelize(o.replace(/^--/, ""));
    if (
      typeof options[camelizedKey] !== "function" &&
      typeof options[camelizedKey] !== "undefined"
    ) {
      args[camelizedKey] = options[camelizedKey];
    }
  });

  return args;
};
