export function processenv (key: string, defaultValue: string): string | undefined {
  return process.env[key] ? process.env[key] : defaultValue;
};
