
const chalk = require('chalk')
const { table } = require('table')

module.exports = (vorpal, broker) => {
    const { state, registry } = broker
    vorpal
        .command('nodes', 'List connected nodes')
        .action((args, done) => {
            const data = []
            data.push([
                chalk.bold('Node ID'),
                chalk.bold('Services'),
                chalk.bold('Version'),
                chalk.bold('Client'),
                chalk.bold('IP'),
                chalk.bold('State'),
                chalk.bold('CPU')
            ])

            const nodes = registry.getNodeList({})

            nodes.map(node => {
                let cpuLoad = '?'
                if (node.cpu !== null) {
                    const width = 20
                    const c = Math.round(node.cpu / (100 / width))
                    cpuLoad = ['['].concat(Array(c).fill('■'), Array(width - c).fill('.'), ['] ', node.cpu.toFixed(0), '%']).join('')
                }

                data.push([
                    node.id === state.nodeId ? `${node.id}(*)` : node.id,
                    node.services ? Object.keys(node.services).length : 0,
                    node.client.version,
                    node.client.type,
                    node.IPList[0],
                    node.isAvailable ? chalk.bgGreen.black(' ONLINE ') : chalk.bgRed.white.bold(' OFFLINE '),
                    cpuLoad
                ])
            })
            const tableConf = {}

            console.log(table(data, tableConf))
            done()
        })
}
