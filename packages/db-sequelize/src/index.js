const Sequelize = require('sequelize')
const op = Sequelize.Op

const operatorsAliases = {
    $like: op.like,
}

module.exports = (...options) => {
    let s
    let model
    let idFieldName
    return {    
        init (weave, service) {
            if (!service.schema.model) {
                throw new Error('Model not defined!')
            }

            if (typeof service.schema.model !== 'object') throw new Error('Model needs to be an object!')

            if (!service.schema.model.name) throw new Error('Model needs a name!')

            s = service
            idFieldName = service.settings.idField
            logger = weave.getLogger('Sequelize DB adapter')
        },
        connect () {
            const self = this
            // options[1].operatorsAliases = operatorsAliases
            self.db = new Sequelize(...options)
   
            return this.db.authenticate()
                .then(() => {
                    const m = s.schema.model
                    s.model = self.db.define(m.name, m.schema, m.options)
                    return s.model.sync()
                })
        },
        createMany(entities) {
            // return validate(entity)
            //     .then(ent => transform(ent))
            //     .then(entity => {
            //         return Promise.resolve(_db.collection(model.name).insert(entity))
            //     })

            return s.model.bulkCreate(entities)
        },
        create(entity) {
            // return validate(entity)
            //     .then(ent => transform(ent))
            //     .then(entity => {
            //         return Promise.resolve(_db.collection(model.name).insert(entity))
            //     })

            return model.create(entity)
        },
        count (params) {
            const options = {}
            if (params && params.query) {
                options.where = params.query
            }
            return s.model.count(options)
        },
        find (params) {
            const options = {}

            if (params.query) {
                options.where = params.query
            }

            if (params.limit) {
                options.limit = Number(params.limit) || 1000

            }            
            if (params.offset) {
                options.offset = params.offset
            }

            if (params.order) {
                options.order = params.order
            }

            if (params.group) {
                options.group = params.group
            }

            if (params.distinct) {
                options.distinct = params.distinct
            }

            return s.model.findAll(options)
        },
        findById (id) {
            return s.model.findById(id)
        },
        findByIds (id) {
            return s.model.findAll({ where: { [idFieldName]: id }})
        },
        updateById (id, entity) {
            return s.model.update(entity, { where: { [idFieldName]: id }})
        },
        removeById (id) {
            return s.model.destroy({ where: { [idFieldName]: id }})   
        }
    }
}