import { table } from "table";

export default ({ vorpal, broker, cliUI }: any) => {
  vorpal.command("services", "List services").action((args: any, done: any) => {
    const data = [];
    data.push([
      cliUI.tableHeaderText("Service"),
      cliUI.tableHeaderText("Version"),
      cliUI.tableHeaderText("Visibility"),
      cliUI.tableHeaderText("State"),
      cliUI.tableHeaderText("Actions"),
      cliUI.tableHeaderText("Events"),
      cliUI.tableHeaderText("Nodes"),
    ]);

    const list = [];
    const services = broker.runtime.registry.serviceCollection.list({
      withActions: true,
      withEvents: true,
      withNodeService: true,
      withPrivate: true,
    });

    services.map((service: any) => {
      let item = list.find(
        (item: any) => item.name === service.name && item.version === service.version,
      );

      if (item) {
        item.nodes.push({
          nodeId: service.nodeId,
          isAvailable: service.isAvailable,
        });
      } else {
        item = Object.create(null);
        item.name = service.name;
        item.version = service.version;
        item.isPrivate = service.isPrivate;
        item.isAvailable = service.isAvailable;
        item.actions = service.actions ? Object.keys(service.actions).length : 0;
        item.events = service.events ? Object.keys(service.events).length : 0;
        item.nodes = [
          {
            nodeId: service.nodeId,
            isAvailable: service.isAvailable,
          },
        ];
        list.push(item);
      }
    });

    list.map((service: any) => {
      data.push([
        service.name,
        service.version ? service.version : "-",
        service.isPrivate ? cliUI.failureLabel(" PRIVATE ") : cliUI.successLabel(" PUBLIC "),
        service.isAvailable ? cliUI.successLabel("  OK  ") : cliUI.failureLabel(" FAILURE "),
        service.actions,
        service.events,
        service.nodes.length,
      ]);
    });

    const tableConf = {};

    console.log(table(data, tableConf));
    done();
  });
};
