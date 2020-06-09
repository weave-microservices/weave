module.exports.isJSONString = function isJSONString (string) {
  try {
    JSON.parse(string)
  } catch (e) {
    return false
  }

  return true
}
