
const { table } = require('table');

module.exports = ({ vorpal, broker, cliUI }) => {
  vorpal
    .command('services', 'List services')
    .action((args, done) => {
      const data = [];
      data.push([
        cliUI.tableHeaderText('Service'),
        cliUI.tableHeaderText('Version'),
        cliUI.tableHeaderText('State'),
        cliUI.tableHeaderText('Actions'),
        cliUI.tableHeaderText('Events'),
        cliUI.tableHeaderText('Nodes')
      ]);

      const list = [];
      const services = broker.runtime.registry.serviceCollection.list({
        withActions: true,
        withEvents: true,
        withNodeService: true
      });

      services.map(service => {
        let item = list.find(item => item.name === service.name && item.version === service.version);

        if (item) {
          item.nodes.push({
            nodeId: service.nodeId,
            isAvailable: service.isAvailable
          });
        } else {
          item = Object.create(null);
          item.name = service.name;
          item.version = service.version;
          item.isAvailable = service.isAvailable;
          item.actions = service.actions ? Object.keys(service.actions).length : 0;
          item.events = service.events ? Object.keys(service.events).length : 0;
          item.nodes = [{
            nodeId: service.nodeId,
            isAvailable: service.isAvailable
          }];
          list.push(item);
        }
      });

      list.map(service => {
        data.push([
          service.name,
          service.version ? service.version : '-',
          service.isAvailable ? cliUI.successLabel('  OK  ') : cliUI.failureLabel(' FAILURE '),
          service.actions,
          service.events,
          service.nodes.length
        ]);
      });

      const tableConf = {};

      console.log(table(data, tableConf));
      done();
    });
};
