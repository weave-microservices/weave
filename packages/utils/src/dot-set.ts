import { isObject } from './is-object';
import { Path, PathValue } from './helper/dot-notation-path';
type NotEmpty<T> = keyof T extends never ? never : T

type Pick<T> = { [K in keyof T]: T[K] };

type Property = string | symbol | number

export function dotSet<T extends Record<string, any>, V>(targetObject: T, key: Property, value: V): T {
  if (typeof key === 'string' && key.includes('.')) {
    const pathArray = key.split('.');
    
    return pathArray.reduce((obj, property, index) => {
      const isTargetProp = (index + 1) === pathArray.length;
      const currentIsOject = isObject(obj[property]);
      
      if (obj[property as keyof T] === undefined && !isTargetProp) {
        Object.assign(obj, { [property]: {} })
      } else if (!isTargetProp && currentIsOject) {
        return obj[property as keyof T];
      } else if (isTargetProp) {
        Object.assign(obj, { [property]: value })
      } else {
        throw new Error(`The property "${property}" already exists and is not an object.`);
      }
      return obj[property as keyof T];
    }, targetObject);
  } else {
    Object.assign(targetObject, { [key]: value })
  }

  return targetObject;
};
