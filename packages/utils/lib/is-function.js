const tagTester = require('./helper/tag-tester')

module.exports.isFunction = obj => tagTester('Function')(obj)

