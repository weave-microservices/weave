const defaultError = new Error("Promise timed out.");

/**
 * Execute a promise with a timeout
 * @param ms - Timeout in milliseconds
 * @param promise - Promise to execute
 * @param error - Error to throw on timeout
 * @returns Promise that rejects on timeout
 */
export function promiseTimeout<T>(
  ms: number,
  promise: Promise<T>,
  error: Error = defaultError,
): Promise<T> {
  let id: NodeJS.Timeout;

  const timeout = new Promise<T>((resolve, reject) => {
    id = setTimeout(() => {
      clearTimeout(id);
      reject(error);
    }, ms);
  });

  // Returns a race between our timeout and the passed in promise
  return Promise.race([promise, timeout]).then((result) => {
    clearTimeout(id);
    return result;
  });
}
