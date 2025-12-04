const asyncTag = "[object AsyncFunction]";
const funcTag = "[object Function]";
const genTag = "[object GeneratorFunction]";
const proxyTag = "[object Proxy]";

/**
 * Check if an object is a valid function.
 * @param obj - Object to check
 * @returns True if object is a function
 */
export function isFunction(obj: unknown): obj is Function {
  const tag = Object.prototype.toString.call(obj);
  return tag === asyncTag || tag === funcTag || tag === genTag || tag === proxyTag;
}
