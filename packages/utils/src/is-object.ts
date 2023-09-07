export function isObject (obj: unknown): boolean {
  return obj ? typeof obj === 'object' : false;
}
