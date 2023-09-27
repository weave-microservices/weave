
const addTask = require('./add.action');
const deleteTask = require('./delete.action');

module.exports = {
  name: 'tast',
  actions: {
    ...addTask,
    ...deleteTask
  }
};
