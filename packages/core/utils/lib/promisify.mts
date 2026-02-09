/**
 * Wraps a function in a promise
 * @param callback - Function to promisify
 * @returns Promisified function
 */
export function promisify<TArgs extends any[], TReturn>(
  callback: (...args: TArgs) => TReturn,
): (...args: TArgs) => Promise<Awaited<TReturn>> {
  return function makePromisedFunction(...args: TArgs): Promise<Awaited<TReturn>> {
    return new Promise((resolve, reject) => {
      try {
        return resolve(callback(...args) as Awaited<TReturn>);
      } catch (error) {
        return reject(error);
      }
    });
  };
}
