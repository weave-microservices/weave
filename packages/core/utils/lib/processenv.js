/**
 * Get Process env var or default value
 * @template T
 * @param {string} key
 * @param {T} [defaultValue]
 * @returns {string | infer T | undefined}
 */
exports.processenv = (key, defaultValue) => {
  return process.env[key] ? process.env[key] : defaultValue;
};
