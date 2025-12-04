const camelize = (str: string): string => {
  return str.replace(/-(\w)/g, (_, c) => (c ? c.toUpperCase() : ""));
};

export const cleanArgs = (options: any): Record<string, any> => {
  const args: Record<string, any> = {};
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
