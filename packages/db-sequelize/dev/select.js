const Weave = require('weave-core')
const DBAdapterMixin = require('weave-db')
const SqlAdapter = require('../src')
const Sequelize = require('sequelize')

const broker = Weave({
    nodeId: 'node'
})

broker.createService({
    name: 'user',
    mixins: [DBAdapterMixin()],
    adapter: SqlAdapter({
        host: 'localhost',
        port: 3308,
        username: 'root',
        password: 'mysql',
        dialect: 'mysql',
        database: 'gptprod'
    }),
    model: {
        name: 'gpt_backoffice_users',
        schema: {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true
            },
            username: Sequelize.STRING,
            username: Sequelize.STRING,
        },
        options: {
            timestamps: false
        }
    }
})

broker.start()
    .then(() => {
        broker.call('user.find').then(console.log)
    })