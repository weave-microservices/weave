
import { Path, PathValue, Property } from './helper/dot-notation-path';

export function dotGet<T extends Record<string, any>>(object: T, key: Property): any {
  if (typeof key === 'string' && key.includes('.')) {
    return key.split('.').reduce((obj, i) => obj[i], object);
  }

  return object[key];
};
