const Tree = require('../lib/router/tree')

const tree = Tree()

tree.insert(['Kevin', 'Ries', 'Kevin Ries'])

const result = tree.resolve('test')
console.log(result)