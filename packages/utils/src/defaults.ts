const { isObject } = require('./is-object');

export function defaultsDeep (...args: any[]): Object {
  const length = args.length;
  let object = args[0];
  object = Object(object);

  if (length < 2 || object == null) {
    return object;
  }

  for (let index = 1; index < length; index++) {
    const source = args[index];

    if (!source) {
      continue;
    }

    const keys = Object.keys(source);
    const le = keys.length;

    for (let i = 0; i < le; i++) {
      const key = keys[i];

      if (object[key] === void 0) {
        object[key] = source[key];
      } else if (isObject(object[key])) {
        object[key] = defaultsDeep(object[key], source[key]);
      }
    }
  }

  return object;
};
