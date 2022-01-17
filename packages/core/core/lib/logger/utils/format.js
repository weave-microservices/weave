const tryStringify = (o) => {
  try {
    return JSON.stringify(o)
  } catch (e) {
    return '"[Circular]"'
  }
}

exports.format = (f, args, opts) => {
  const ss = (opts && opts.stringify) || tryStringify
  const offset = 1
  if (typeof f === 'object' && f !== null) {
    const len = args.length + offset
    if (len === 1) return f
    const objects = new Array(len)
    objects[0] = ss(f)
    for (let index = 1; index < len; index++) {
      objects[index] = ss(args[index])
    }
    return objects.join(' ')
  }
  if (typeof f !== 'string') {
    return f
  }
  const argumentLength = args.length
  if (argumentLength === 0) return f

  let str = ''
  let a = 1 - offset
  let lastPos = -1
  const formatLength = (f && f.length) || 0

  for (let i = 0; i < formatLength;) {
    if (f.charCodeAt(i) === 37 && i + 1 < formatLength) {
      lastPos = lastPos > -1 ? lastPos : 0
      switch (f.charCodeAt(i + 1)) {
      case 100: // 'd'
      case 102: // 'f'
        if (a >= argumentLength) { break }
        if (lastPos < i) { str += f.slice(lastPos, i) }
        if (args[a] == null) break
        str += Number(args[a])
        lastPos = i = i + 2
        break
      case 105: // 'i'
        if (a >= argumentLength) { break }
        if (lastPos < i) { str += f.slice(lastPos, i) }
        if (args[a] == null) break
        str += Math.floor(Number(args[a]))
        lastPos = i = i + 2
        break
      case 79: // 'O'
      case 111: // 'o'
      case 106: // 'j'
        if (a >= argumentLength) {
          break
        }

        if (lastPos < i) {
          str += f.slice(lastPos, i)
        }

        if (args[a] === undefined) {
          break
        }

        const type = typeof args[a]

        if (type === 'string') {
          str += '\'' + args[a] + '\''
          lastPos = i + 2
          i++
          break
        }

        if (type === 'function') {
          str += args[a].name || '<anonymous>'
          lastPos = i + 2
          i++
          break
        }

        str += ss(args[a])
        lastPos = i + 2
        i++
        break
      case 115: // 's'
        if (a >= argumentLength) { break }
        if (lastPos < i) {
          str += f.slice(lastPos, i)
        }
        str += String(args[a])
        lastPos = i + 2
        i++
        break
      case 37: // '%'
        if (lastPos < i) { str += f.slice(lastPos, i) }
        str += '%'
        lastPos = i + 2
        i++
        a--
        break
      }
      ++a
    }
    ++i
  }

  if (lastPos === -1) { return f } else if (lastPos < formatLength) {
    str += f.slice(lastPos)
  }

  return str
}
