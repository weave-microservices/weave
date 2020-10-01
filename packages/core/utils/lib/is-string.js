const tagTester = require('./helper/tag-tester')

module.exports.isString = obj => tagTester('String')(obj)

