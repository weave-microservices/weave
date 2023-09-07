const { table } = require('table');

module.exports = ({ vorpal, broker, cliUI }) => {
  vorpal
    .command('metrics', 'Show node metrics.')
    .action((args, done) => {
      if (!broker.runtime.metrics) {
        console.log('Metrics are not enabled on this node');
      } else {
        const data = [];

        data.push([
          cliUI.tableHeaderText('Description'),
          cliUI.tableHeaderText('Name'),
          cliUI.tableHeaderText('Type'),
          cliUI.tableHeaderText('Labels'),
          cliUI.tableHeaderText('Value')
        ]);

        const tableConf = {};
        const metrics = broker.runtime.metrics.list();

        metrics.forEach(metric => {
          if (metric.value.length === 0) {
            data.push([
              metric.description,
              metric.name,
              metric.type,
              '',
              cliUI.neutralText('no value')
            ]);
          } else {
            metric.value.forEach(value => {
              const labels = value.labels || '';

              data.push([
                metric.description,
                metric.name,
                metric.type,
                labels,
                value.value
              ]);
            });
          }
        });

        console.log(table(data, tableConf));
      }

      done();
    });
};
