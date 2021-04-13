const tagTester = require('./helper/tag-tester')

exports.isString = obj => tagTester('String')(obj)

