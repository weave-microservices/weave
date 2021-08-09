module.exports = name => {
  return (obj) => {
    return Object.prototype.toString.call(obj) === '[object ' + name + ']'
  }
}
