// Regex to escape quoted property names for eval/new Function
const escapeEvalRegex = /[''\\\n\r\u2028\u2029]/g;

/* istanbul ignore next */
exports.escapeEvalString = (str) => {
  // Based on https://github.com/joliss/js-string-escape
  return str.replace(escapeEvalRegex, character => {
    switch (character) {
    case '\'':
    case '"':
    case '':
    case '\\':
      return '\\' + character;
      // Four possible LineTerminator characters need to be escaped:
    case '\n':
      return '\\n';
    case '\r':
      return '\\r';
    case '\u2028':
      return '\\u2028';
    case '\u2029':
      return '\\u2029';
    }
  });
};
