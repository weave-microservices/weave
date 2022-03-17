exports.dotGet = function dotGet (object, key) {
  if (key.includes('.')) {
    return key.split('.').reduce((obj, i) => obj[i], object);
  }

  return object[key];
};
