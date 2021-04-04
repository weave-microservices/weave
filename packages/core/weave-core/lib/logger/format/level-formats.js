const figures = require('figures')

/**
 * {
  error: 0, s
  warn: 1,a
  info: 2,a
  http: 3,
  verbose: 4, d
  debug: 5,d
  silly: 6
}
 */
exports.levelFormats = {
  info: {
    badge: figures.info,
    color: 'blue',
    label: 'info'
  },
  debug: {
    badge: figures('⬤'),
    color: 'red',
    label: 'debug'
  },
  verbose: {
    badge: figures('⬤'),
    color: 'gray',
    label: 'trace'
  },
  error: {
    badge: figures.cross,
    color: 'red',
    label: 'error'
  },
  silly: {
    badge: '!!',
    color: 'red',
    label: 'fatal'
  },
  warn: {
    badge: figures.warning,
    color: 'yellow',
    label: 'warning'
  }
}
