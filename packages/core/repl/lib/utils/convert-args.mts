export default function convertArgs(args: any): any {
  const res: any = {};

  Object.keys(args).forEach((key) => {
    const value = args[key];
    if (Array.isArray(value)) {
      res[key] = value;
    } else if (typeof value === "object") {
      res[key] = convertArgs(value);
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
