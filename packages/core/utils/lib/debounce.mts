export type DebounceCallback = (...args: unknown[]) => void;

/**
 * Creates a debounced function that delays invoking func until after wait milliseconds
 * have elapsed since the last time the debounced function was invoked.
 * @param func - The function to debounce
 * @param wait - Time to wait for execution in milliseconds
 * @param immediate - If true, trigger function on leading edge instead of trailing
 * @returns The debounced function
 * @example
 * const debouncedSave = debounce(saveData, 300);
 * debouncedSave(); // Will execute saveData after 300ms of no additional calls
 */
export function debounce(
  func: DebounceCallback,
  wait: number,
  immediate: boolean = false,
): DebounceCallback {
  let timeout: NodeJS.Timeout | null;

  return function (this: unknown, ...args: unknown[]) {
    const later = () => {
      timeout = null;
      if (!immediate) {
        func.apply(this, args);
      }
    };

    const callNow = immediate && !timeout;

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);

    if (callNow) {
      func.apply(this, args);
    }
  };
}
