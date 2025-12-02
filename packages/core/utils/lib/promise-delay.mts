/**
 * Execute a promise with delay
 * @param promise - Promise to delay
 * @param ms - Delay in milliseconds
 * @returns Delayed promise
 */
export function promiseDelay<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(promise);
    }, ms);
  });
}
