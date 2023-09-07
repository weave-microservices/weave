export function debounce (func: Function, wait: number, immediate: boolean = false): Function {
  let timeout: NodeJS.Timeout | null;

  return function (this: any) {
    const context = this;
    const args = arguments;
    const later = () => {
      timeout = null;
      if (!immediate) {
        func.apply(context, args);
      }
    };

    const callNow = immediate && !timeout;

    clearTimeout(timeout as NodeJS.Timeout);
    timeout = setTimeout(later, wait);

    if (callNow) {
      func.apply(context, args);
    }
  };
};
