/**
 * @fileoverview String escaping utilities for safe code generation
 * @author Kevin Ries <kevin.ries@fachwerk.io>
 * @version 0.14.0
 */

/**
 * Regular expression to match characters that need escaping in eval/new Function contexts
 * Includes quotes, backslashes, and line terminators
 * @type {RegExp}
 * @constant
 */
const escapeEvalRegex = /[''\\\n\r\u2028\u2029]/g;

/* istanbul ignore next */
/**
 * Escapes a JavaScript string for safe use in eval() or new Function() contexts
 * This prevents code injection and syntax errors when generating dynamic code
 *
 * @param {string} str - The JavaScript string to escape
 * @returns {string} The escaped string safe for code generation
 * @see {@link https://github.com/joliss/js-string-escape} - Based on js-string-escape
 * @example
 * // Escape a property name with quotes
 * const escaped = escapeEvalString("user's name");
 * console.log(escaped); // "user\\'s name"
 *
 * @example
 * // Safe property access generation
 * const propName = "line\nbreak";
 * const code = `obj["${escapeEvalString(propName)}"]`;
 * // Generates: obj["line\\nbreak"]
 */
exports.escapeEvalString = (str) => {
  // Based on https://github.com/joliss/js-string-escape
  return str.replace(escapeEvalRegex, (character) => {
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
