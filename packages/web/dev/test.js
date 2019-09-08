const Tree = require('../lib/router/router')

const tree = Tree()

tree.on('GET', '/', () => {

})

tree.on('GET', '/test', () => {
    
})

tree.on('GET', '/testing', () => {
    
})

const result = tree.resolve('test')
console.log(result)