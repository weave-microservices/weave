const asyncTag = '[object AsyncFunction]';
const funcTag = '[object Function]';
const genTag = '[object GeneratorFunction]';
const proxyTag = '[object Proxy]';

exports.isFunction = obj => {
  const tag = Object.prototype.toString.call(obj);
  return tag === asyncTag || tag === funcTag || tag === genTag || tag === proxyTag;
};

