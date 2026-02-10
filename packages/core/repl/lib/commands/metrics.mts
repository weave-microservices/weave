import pkg from "table";
const { table } = pkg;

export default ({ vorpal, broker, cliUI }: any) => {
  vorpal.command("metrics", "Show node metrics.").action((args: any, done: any) => {
    if (!broker.runtime.metrics) {
      console.log("Metrics are not enabled on this node");
    } else {
      const data = [];

      data.push([
        cliUI.tableHeaderText("Description"),
        cliUI.tableHeaderText("Name"),
        cliUI.tableHeaderText("Type"),
        cliUI.tableHeaderText("Labels"),
        cliUI.tableHeaderText("Value"),
      ]);

      const tableConf = {};
      const metrics = broker.runtime.metrics.list();

      metrics.forEach((metric: any) => {
        if (metric.value.length === 0) {
          data.push([
            metric.description,
            metric.name,
            metric.type,
            "",
            cliUI.neutralText("no value"),
          ]);
        } else {
          metric.value.forEach((value: any) => {
            const labels = value.labels || "";

            data.push([metric.description, metric.name, metric.type, labels, value.value]);
          });
        }
      });

      console.log(table(data, tableConf));
    }

    done();
  });
};
