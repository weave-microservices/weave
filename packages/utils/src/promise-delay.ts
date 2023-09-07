export function promiseDelay(promise: Promise<any>, ms: number): Promise<any> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(promise);
    }, ms);
  });
};
