type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>

export function omit<T, K extends keyof T>(obj: T, ...fields: K[]): Omit<T, K> | null {
  if (obj === null) {
    return null;
  }

  const shallowCopy = Object.assign({}, obj);

  for (let i = 0; i < fields.length; i++) {
    const key = fields[i];
    delete shallowCopy[key];
  }

  return shallowCopy;
};
