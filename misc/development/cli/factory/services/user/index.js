
const addUser = require('./add.action');

module.exports = {
  name: 'user',
  actions: {
    ...addUser
  }
};
