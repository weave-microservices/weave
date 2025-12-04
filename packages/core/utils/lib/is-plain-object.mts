/**
 * Checks if the given object is a plain object.
 * @param object - Object to check
 * @param strict - Strict mode check
 * @returns True if object is a plain object
 */
export function isPlainObject(
  object: unknown,
  strict: boolean = true,
): object is Record<string, unknown> {
  if (object === null || object === undefined) {
    return false;
  }

  const instanceOfObject = object instanceof Object;
  const typeOfObject = typeof object === "object";
  const constructorUndefined = object.constructor === undefined;
  const constructorObject = object.constructor === Object;
  const typeOfConstructorObject = typeof object.constructor === "function";

  let result: boolean;

  if (strict === true) {
    result = (instanceOfObject || typeOfObject) && (constructorUndefined || constructorObject);
  } else {
    result = constructorUndefined || typeOfConstructorObject;
  }

  return result;
}
