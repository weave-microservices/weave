module.exports = (vorpal, broker) => {
    vorpal
        .command('clear', 'Clear console.')
        .alias('cc')
        .action((_, done) => {
            process.stdout.write('\x1Bc')
            done()
        })
}
