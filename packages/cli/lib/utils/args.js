const camelize = (str) => {
  return str.replace(/-(\w)/g, (_, c) => c ? c.toUpperCase() : '');
};

exports.cleanArgs = (options) => {
  const args = {};
  Object.keys(options).forEach(o => {
    const camelizedKey = camelize(o.replace(/^--/, ''));
    if (typeof options[camelizedKey] !== 'function' && typeof options[camelizedKey] !== 'undefined') {
      args[camelizedKey] = options[camelizedKey];
    }
  });

  return args;
};
