const defaultError = new Error('Promise timed out.');

export function promiseTimeout (ms: number, promise: Promise<any>, error: Error = defaultError): Promise<any> {
  let id: NodeJS.Timeout;

  const timeout = new Promise((resolve, reject) => {
    id = setTimeout(() => {
      clearTimeout(id);
      reject(error);
    }, ms);
  });

  return Promise.race([
    promise,
    timeout
  ]).then((result) => {
    clearTimeout(id);
    return result;
  });
};
