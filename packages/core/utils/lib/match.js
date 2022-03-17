const RegexCache = new Map();

exports.match = function match (text, pattern) {
  if (pattern.indexOf('?') === -1) {
    const firstStarPosition = pattern.indexOf('*');

    if (firstStarPosition === -1) {
      return pattern === text;
    }

    const len = pattern.length;

    if (len > 2 && pattern.endsWith('**') && firstStarPosition > len - 3) {
      pattern = pattern.substring(0, len - 2);
      return text.startsWith(pattern);
    }

    // Eg. 'prefix*'
    if (len > 1 && pattern.endsWith('*') && firstStarPosition > len - 2) {
      pattern = pattern.substring(0, len - 1);

      if (text.startsWith(pattern)) {
        return text.indexOf('.', len) === -1;
      }

      return false;
    }

    if (len === 1 && firstStarPosition === 0) {
      return text.indexOf('.') === -1;
    }

    if (len === 2 && firstStarPosition === 0 && pattern.lastIndexOf('*') === 1) {
      return true;
    }
  }

  // Handle regex patterns
  let regex = RegexCache.get(pattern);
  if (regex == null) {
    if (pattern.startsWith('$')) {
      pattern = '\\' + pattern;
    }

    pattern = pattern.replace(/\?/g, '.');
    pattern = pattern.replace(/\*\*/g, '.+');
    pattern = pattern.replace(/\*/g, '[^\\.]+');
    pattern = '^' + pattern + '$';

    regex = new RegExp(pattern, 'g');

    RegexCache.set(pattern, regex);
  }
  return regex.test(text);
};
