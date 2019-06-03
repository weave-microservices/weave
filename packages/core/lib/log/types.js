const figures = require('figures')

module.exports = {
    log: {
        badge: '',
        color: '',
        label: '',
        logLevel: 'info'
    },
    info: {
        badge: figures.info,
        color: 'blue',
        label: 'info',
        logLevel: 'info'
    },
    success: {
        badge: figures.tick,
        color: 'green',
        label: 'success',
        logLevel: 'info'
    },
    progress: {
        badge: figures.pointer,
        color: 'yellow',
        label: 'progress',
        logLevel: 'info'
    },
    debug: {
        badge: figures('⬤'),
        color: 'red',
        label: 'debug',
        logLevel: 'debug'
    },
    trace: {
        badge: figures('⬤'),
        color: 'blue',
        label: 'trace',
        logLevel: 'debug'
    },
    error: {
        badge: figures.cross,
        color: 'red',
        label: 'error',
        logLevel: 'error'
    },
    fatal: {
        badge: '!!',
        color: 'red',
        label: 'fatal',
        logLevel: 'fatal'
    },
    warn: {
        badge: figures.warning,
        color: 'yellow',
        label: 'warning',
        logLevel: 'warn'
    },
    wait: {
        badge: figures.ellipsis,
        color: 'blue',
        label: 'waiting',
        logLevel: 'info'
    },
    complete: {
        badge: figures.checkboxOn,
        color: 'cyan',
        label: 'complete',
        logLevel: 'info'
    },
    note: {
        badge: figures.bullet,
        color: 'blue',
        label: 'note',
        logLevel: 'info'
    },
    star: {
        badge: figures.star,
        color: 'yellow',
        label: 'star',
        logLevel: 'info'
    },
    fav: {
        badge: figures('❤'),
        color: 'magenta',
        label: 'favorite',
        logLevel: 'info'
    }
}
