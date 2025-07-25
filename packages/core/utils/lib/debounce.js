/**
 * Debounce function execution
 * @param {import("../types").DebounceCallback} func
 * @param {number} wait Time to wait for execution
 * @param {boolean} immediate Execute immediately
 * @returns void
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
