const ansiRegex = ({ onlyFirst = false } = {}) => {
  const pattern = [
    '[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:[a-zA-Z\\d]*(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)',
    '(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-ntqry=><~]))'
  ].join('|')

  return new RegExp(pattern, onlyFirst ? undefined : 'g')
}

exports.stripAnsi = (string) => {
  if (typeof string !== 'string') {
    throw new TypeError(`Expected a \`string\`, got \`${typeof string}\``)
  }

  return string.replace(ansiRegex(), '')
}
