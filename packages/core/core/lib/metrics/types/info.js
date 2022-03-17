const { createBaseMetricType } = require('./base');

exports.createInfo = (metricRegistry, obj) => {
  const base = createBaseMetricType(metricRegistry, obj);

  base.generateSnapshot = () => {
    return Array.from(base.values)
      .map(([labelString, item]) => {
        return {
          value: item.value,
          labels: item.labels
        };
      });
  };

  base.set = (value, labels, timestamp) => {
    const labelString = base.stringifyLabels(labels);
    const item = base.values.get(labelString);

    base.value = value;

    if (item) {
      if (item.value !== value) {
        item.labels = labels;
        item.value = value;
        item.timestamp = timestamp || Date.now();
      }
    } else {
      const item = {
        labels: labels,
        value: value,
        timestamp: timestamp || Date.now()
      };

      base.values.set(labelString, item);
    }
    return item;
  };

  return base;
};
