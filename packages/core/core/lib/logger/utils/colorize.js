const init = (x, y) => {
  const regex = new RegExp(`\\x1b\\[${y}m`, 'g')
  const open = `\x1b[${x}m`; const close = `\x1b[${y}m`

  return function (txt) {
    return open + (~('' + txt).indexOf(close) ? txt.replace(regex, close + open) : txt) + close
  }
}

// modifiers
exports.bold = init(1, 22)
exports.dim = init(2, 22)
exports.hidden = init(8, 28)
exports.inverse = init(7, 27)
exports.italic = init(3, 23)
exports.reset = init(0, 0)
exports.strikeThrough = init(9, 29)
exports.underline = init(4, 24)

// colors
exports.black = init(30, 39)
exports.blue = init(34, 39)
exports.cyan = init(36, 39)
exports.gray = init(90, 39)
exports.green = init(32, 39)
exports.grey = init(90, 39)
exports.magenta = init(35, 39)
exports.red = init(31, 39)
exports.white = init(37, 39)
exports.yellow = init(33, 39)

// todo: bg colors
