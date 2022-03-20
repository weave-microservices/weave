
const { table } = require('table');

module.exports = ({ vorpal, broker, cliUI }) => {
  vorpal
    .command('actions', 'List actions')
    .option('-l, --local', 'Show only local actions.')
    .action((args, done) => {
      const tableConf = {};
      const data = [];

      data.push([
        ('Action'),
        cliUI.tableHeaderText('Nodes'),
        cliUI.tableHeaderText('State'),
        cliUI.tableHeaderText('Cached'),
        cliUI.tableHeaderText('Params')
      ]);

      const listOptions = {
        withEndpoints: true,
        onlyLocals: !!args.options.local
      };

      const actions = broker.runtime.registry.actionCollection.list(listOptions);

      if (actions.length === 0) {
        tableConf['spanningCells'] = [
          { col: 0, row: 1, colSpan: 5, alignment: 'center' }
        ];

        data.push([
          'No actions found',
          '',
          '',
          '',
          ''
        ]);
      } else {
        actions.map(item => {
          const action = item.action;
          const params = action && action.params ? Object.keys(action.params).join(', ') : '';

          if (action) {
            data.push([
              action.name,
              item.hasLocal ? `(*)${item.count}` : item.count,
              item.hasAvailable ? cliUI.successLabel('  OK  ') : cliUI.failureLabel(' FAILURE '),
              action.cache ? cliUI.successText('Yes') : cliUI.neutralText('No'),
              params
            ]);
          }
        });
      }

      console.log(table(data, tableConf));

      done();
    });
};
