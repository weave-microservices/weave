
const addTask = require('./add.action');
const deleteTask = require('./delete.action');

module.exports = {
  name: 'task',
  actions: {
    ...addTask,
    ...deleteTask
  }
};
