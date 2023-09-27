module.exports = (broker) => {
  broker.createService(require('./user/index.js'));
  broker.createService(require('./task/index.js'));
};
