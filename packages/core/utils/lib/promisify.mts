/**
 * Wraps a function in a promise
 * @param callback - Function to promisify
 * @returns Promisified function
 */
export function promisify<T extends (...args: unknown[]) => unknown>(callback: T): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  return function makePromisedFunction(this: unknown, ...args: unknown[]): Promise<ReturnType<T>> {
    return new Promise((resolve, reject) => {
      try {
        return resolve(callback.apply(this, args) as ReturnType<T>);
      } catch (error) {
        return reject(error);
      }
    });
  };
}
