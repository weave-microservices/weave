const os = require('os');

exports.asJson = (runtime, originObj, message, number, time) => {
  const data = {
    level: number,
    time,
    ...runtime.fixtures
  };

  if (message !== undefined) {
    data[runtime.options.messageKey] = message;
  }

  const doesNotHaveOwnProperty = originObj.hasOwnProperty === undefined;

  let value;
  for (const key in originObj) {
    value = originObj[key];
    if ((doesNotHaveOwnProperty || originObj.hasOwnProperty(key)) && value !== undefined) {
      data[key] = value;
    }
  }

  return JSON.stringify(data) + os.EOL;
};
