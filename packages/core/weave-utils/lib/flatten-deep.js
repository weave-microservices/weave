module.exports.flattenDeep = function flattenDeep (arr) {
  return Array.isArray(arr) ? arr.reduce((a, b) => [...flattenDeep(a), ...flattenDeep(b)], []) : [arr]
}
