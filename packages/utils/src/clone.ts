
export function clone<T>(objectToBeCloned: T): T | Date | T[] {
  // handle primitive types
  if (objectToBeCloned === null || typeof objectToBeCloned !== 'object') {
    return objectToBeCloned;
  }

  if (objectToBeCloned instanceof Date) {
    return new Date(objectToBeCloned.getTime());
  }

  if (Array.isArray(objectToBeCloned)) {
    const clonedArr: T[] = [];
    objectToBeCloned.forEach(function (element) {
      clonedArr.push(clone(element));
    });
    return clonedArr;
  }

  const clonedObj = Object.create(Object.getPrototypeOf(objectToBeCloned));
  for (const prop in objectToBeCloned) {
    if (objectToBeCloned.hasOwnProperty(prop)) {
      clonedObj[prop] = clone(objectToBeCloned[prop]);
    }
  }

  return clonedObj;
};
