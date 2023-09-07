const { table } = require('table');

module.exports = ({ vorpal, broker, cliUI }) => {
  vorpal
    .command('events', 'List registered events.')
    .action((args, done) => {
      const tableConf = {};
      const data = [];

      data.push([
        cliUI.tableHeaderText('Event'),
        cliUI.tableHeaderText('Group'),
        cliUI.tableHeaderText('State'),
        cliUI.tableHeaderText('Nodes')
      ]);

      const events = broker.runtime.registry.eventCollection.list({
        withEndpoints: true
      });

      if (events.length === 0) {
        tableConf['spanningCells'] = [
          { col: 0, row: 1, colSpan: 4, alignment: 'center' }
        ];

        data.push([
          'No events',
          '',
          '',
          ''
        ]);
      } else {
        events.map(event => {
          if (event) {
            data.push([
              event.name,
              event.groupName,
              event.hasAvailable ? cliUI.successLabel('  OK  ') : cliUI.failureLabel(' FAILURE '),
              event.count
            ]);
          }
        });
      }

      console.log(table(data, tableConf));
      done();
    });
};
