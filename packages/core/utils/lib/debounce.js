/**
 * Creates a debounced function that delays invoking func until after wait milliseconds
 * have elapsed since the last time the debounced function was invoked.
 * @param {import("../types").DebounceCallback} func - The function to debounce
 * @param {number} wait - Time to wait for execution in milliseconds
 * @param {boolean} [immediate=false] - If true, trigger function on leading edge instead of trailing
 * @returns {import("../types").DebounceCallback} The debounced function
 * @example
 * const debouncedSave = debounce(saveData, 300);
 * debouncedSave(); // Will execute saveData after 300ms of no additional calls
 */
exports.debounce = function debounce (func, wait, immediate = false) {
  let timeout;

  return function () {
    const context = this;
    const args = arguments;
    const later = () => {
      timeout = null;
      if (!immediate) {
        func.apply(context, args);
      }
    };

    const callNow = immediate && !timeout;

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);

    if (callNow) {
      func.apply(context, args);
    }
  };
};
