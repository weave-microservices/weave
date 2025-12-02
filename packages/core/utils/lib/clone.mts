/**
 * Clone an object.
 * @param obj - Object to clone
 * @returns Cloned object
 */
export function clone<T>(obj: T): T {
  // in case of primitives
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  // date objects should be
  if (obj instanceof Date) {
    return new Date(obj.getTime()) as T;
  }

  // handle Array
  if (Array.isArray(obj)) {
    const clonedArr: unknown[] = [];
    obj.forEach(function (element) {
      clonedArr.push(clone(element));
    });
    return clonedArr as T;
  }

  // lastly, handle objects
  const clonedObj = Object.create(Object.getPrototypeOf(obj));
  for (const prop in obj) {
    if (obj.hasOwnProperty(prop)) {
      clonedObj[prop] = clone(obj[prop]);
    }
  }

  return clonedObj;
}
