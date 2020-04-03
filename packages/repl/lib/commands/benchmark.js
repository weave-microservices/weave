const chalk = require('chalk')
const _ = require('lodash')
const util = require('../utils')

module.exports = (vorpal, broker) => {
  vorpal
    .command('benchmark <action> [jsonParams]', 'Benchmark a service Endpoint.')
    .option('--iterations <number>', 'Number of iterations')
    .option('--time <seconds>', 'Time of bench')
    .option('--nodeID <nodeID>', 'NodeID (direct call)')
    .autocomplete({
      data () {
        return _.uniq(broker.registry.actions.list({}).map(item => item.name))
      }
    })
    .action((args, done) => {
      const spinner = util.createSpinner('🚀  Running benchmark... ')
      const action = args.action

      let time = args.options.time != null ? Number(args.options.time) : null
      let payload

      if (!time) {
        time = 5
      }

      if (typeof (args.jsonParams) === 'string') {
        try {
          payload = JSON.parse(args.jsonParams)
        } catch (error) {
          console.log(error.message)
          done()
        }
      }

      let timeout = false
      let requestCounter = 0
      let responseCounter = 0
      let errorCounter = 0

      let sumTime = 0
      let minTime = null
      let maxTime = null

      spinner.start()
      const startTotalTime = process.hrtime()

      setTimeout(() => {
        timeout = true
      }, (time !== null ? time : 60) * 1000)

      const printResult = (duration) => {
        const errorString = errorCounter > 0 ? chalk.red.bold(`${util.formatNumber(errorCounter)} error(s) ${util.formatNumber(errorCounter / responseCounter * 100)}%`) : chalk.grey('0 errors')

        console.log(chalk.green.bold('\nBenchmark results:\n'))
        console.log(chalk.bold(`${util.formatNumber(responseCounter)} requests in ${util.humanizeTime(duration)}`, errorString))
        console.log(`Requests/second: ${chalk.bold(util.formatNumber(responseCounter / duration * 1000))}`)
        console.log(`	Average time: ${chalk.bold(util.humanizeTime(sumTime / responseCounter))}`)
        console.log(`	Min time: ${chalk.bold(util.humanizeTime(minTime))}`)
        console.log(`	Max time: ${chalk.bold(util.humanizeTime(maxTime))}`)
      }

      const handleRequest = (startTime, error) => {
        if (error) {
          errorCounter++
        }
        responseCounter++

        const diff = process.hrtime(startTime)
        const duration = (diff[0] + diff[1] / 1e9) * 1000

        sumTime += duration

        if (minTime === null || duration < minTime) {
          minTime = duration
        }

        if (maxTime === null || duration > maxTime) {
          maxTime = duration
        }

        if (timeout) {
          spinner.stop()
          const diffTotal = process.hrtime(startTotalTime)
          const durationTotal = (diffTotal[0] + diffTotal[1] / 1e9) * 1000
          printResult(durationTotal)
          return done()
        }
        if (requestCounter % 10 * 1000) {
          doRequest()
        } else {
          setImmediate(() => doRequest())
        }
      }

      const doRequest = () => {
        requestCounter++
        const startTime = process.hrtime()
        return broker.call(action, payload)
          .then(result => {
            handleRequest(startTime)
            return result
          })
          .catch(error => {
            handleRequest(startTime, error)
          })
      }

      doRequest()
    })
}
