const { isObject } = require('./is-object');

/**
 * Merge settings with default options.
 * @template T, K
 * @param {K} settings Settings
 * @param {T} [defaults] Default settings
 * @returns {K & T}
 */
exports.defaultsDeep = function defaultsDeep (settings, defaults) {
  const target = Object(settings);

  if (!defaults || target == null) {
    return target;
  }

  const keys = Object.keys(defaults);
  const le = keys.length;

  for (let i = 0; i < le; i++) {
    const key = keys[i];

    if (target[key] === void 0) {
      target[key] = defaults[key];
    } else if (isObject(target[key])) {
      target[key] = defaultsDeep(target[key], defaults[key]);
    }
  }

  return target;
};
