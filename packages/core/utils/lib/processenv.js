exports.processenv = (key, defaultValue) => {
  return process.env[key] ? process.env[key] : defaultValue;
};
