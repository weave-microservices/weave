const vorpal = require('vorpal')()

const glob = require('glob')
const path = require('path')

function registerCommands (vorpal, broker) {
    const files = glob.sync(path.join(__dirname, 'commands', '*.js'))
    files.sort()
    files.forEach(file => {
        if (path.basename(file) !== 'index.js') {
            require(file)(vorpal, broker)
        }
    })
}

module.exports = (broker) => {
    const { stop } = broker
    vorpal.find('exit').remove()

    // exit command
    vorpal
        .command('q', 'Exit application')
        .alias('quit')
        .alias('exit')
        .action((args, done) => {
            stop().then(() => process.exit(0))
            done()
        })

    registerCommands(vorpal, broker)
    vorpal
        .delimiter('weave $')
        .show()
}
