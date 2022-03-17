const { timespanFromUnixTimes } = require('@weave-js/utils');
const createSpinner = require('../utils/create-spinner');
const formatNumber = require('../utils/format-number');

module.exports = ({ vorpal, broker, cliUI }) => {
  vorpal
    .command('benchmark <action> [jsonParams]', 'Benchmark a service Endpoint.')
    .option('--iterations <number>', 'Number of iterations')
    .option('--time <seconds>', 'Time of bench (default 5)')
    .option('--nodeId <nodeId>', 'Node ID (direct call)')
    .autocomplete({
      data () {
        return [...new Set(broker.runtime.registry.actionCollection.list({}).map(item => item.name))];
      }
    })
    .action((args, done) => {
      const spinner = createSpinner('🚀  Running benchmark... ');
      const action = args.action;

      const callOptions = {};

      // Add node ID to call options for direct calls on a specific node.
      if (args.options.nodeId) {
        callOptions.nodeId = args.options.nodeId;
      }

      let time = args.options.time != null ? Number(args.options.time) : null;
      let payload;

      if (!time) {
        time = 5;
      }

      if (typeof (args.jsonParams) === 'string') {
        try {
          payload = JSON.parse(args.jsonParams);
        } catch (error) {
          console.log(error.message);
          done();
        }
      }

      let timeout = false;
      let requestCounter = 0;
      let responseCounter = 0;
      let errorCounter = 0;
      let sumTime = 0;
      let minTime = null;
      let maxTime = null;

      spinner.start();
      const startTotalTime = process.hrtime();

      setTimeout(() => {
        timeout = true;
      }, time * 1000);

      const printResult = (duration) => {
        console.log(cliUI.successText('\nBenchmark results:\n'));
        console.log(cliUI.infoText(`${formatNumber(responseCounter)} requests in ${timespanFromUnixTimes(duration)} ${duration}`));

        if (errorCounter > 0) {
          console.log(cliUI.errorText(`${formatNumber(errorCounter)} error(s) ${formatNumber(errorCounter / responseCounter * 100)}%`));
        } else {
          console.log(cliUI.neutralText('0 errors'));
        }

        console.log(`Requests per second: ${cliUI.highlightedText(formatNumber(responseCounter / duration * 1000))}`);
        console.log(`	Average time: ${cliUI.highlightedText(timespanFromUnixTimes(sumTime / responseCounter))}`);
        console.log(`	Min time: ${cliUI.highlightedText(timespanFromUnixTimes(minTime))}`);
        console.log(`	Max time: ${cliUI.highlightedText(timespanFromUnixTimes(maxTime))}`);
      };

      const handleRequest = (startTime, error) => {
        if (error) {
          errorCounter++;
        }

        responseCounter++;

        const diff = process.hrtime(startTime);
        const duration = (diff[0] + diff[1] / 1e9) * 1000;

        sumTime += duration;

        if (minTime === null || duration < minTime) {
          minTime = duration;
        }

        if (maxTime === null || duration > maxTime) {
          maxTime = duration;
        }

        if (timeout) {
          spinner.stop();
          const diffTotal = process.hrtime(startTotalTime);
          const durationTotal = (diffTotal[0] + diffTotal[1] / 1e9) * 1000;

          printResult(durationTotal);
          return done();
        }

        if (requestCounter % 10 * 1000) {
          doRequest();
        } else {
          setImmediate(() => doRequest());
        }
      };

      const doRequest = () => {
        requestCounter++;
        const startTime = process.hrtime();

        return broker.call(action, payload, callOptions)
          .then(result => {
            handleRequest(startTime);
            return result;
          })
          .catch(error => {
            handleRequest(startTime, error);
          });
      };

      doRequest();
    });
};
