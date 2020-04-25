module.exports = function isStream (data) {
  return data && data.readable === true &&
    typeof data.on === 'function' &&
    typeof data.pipe === 'function'
}
