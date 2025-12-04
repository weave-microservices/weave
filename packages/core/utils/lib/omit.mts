/**
 * Omit fields from object
 * @param obj - Source object
 * @param fields - Fields to omit
 * @returns New object without omitted fields
 */
export function omit<T extends object, K extends keyof T>(obj: T, fields: K[]): Omit<T, K> | null {
  if (obj === null) {
    return null;
  }

  const shallowCopy = Object.assign({}, obj) as any;

  for (let i = 0; i < fields.length; i++) {
    const key = fields[i];
    delete shallowCopy[key];
  }

  return shallowCopy;
}
