const NeDB = require('nedb-core')

function WeaveDbAdapter (options) {
    let db
    let model

    function validateMode (model) {
        if (typeof model === 'string') {
            return true
        }
        if (typeof model === 'object') {
            if (!model.name) throw new Error('Model needs a name!')
        }
    }

    return {
        init (broker, service) {
            if (!service.schema.model) {
                throw new Error('Model not defined!')
            }
            validateMode(service.schema.model)
            model = service.schema.model
            this.$idField = service.schema.settings.idField || '_id'
        },
        connect () {
            return new Promise((resolve, reject) => {
                try {
                    db = new NeDB({
                        filename: `${model.name}.db`,
                        autoload: true
                    })

                    resolve(this)
                } catch (error) {
                    reject(error)
                }
            })
        },
        count (filterParams) {
            const query = filterParams || {}
            return new Promise((resolve, reject) => {
                return db.count(query, (error, count) => {
                    if (error) {
                        return reject(error)
                    }
                    return resolve(count)
                })
            })
        },
        insert (entity) {
            return new Promise((resolve, reject) => {
                return db.insert(entity, (error, newDoc) => {
                    if (error) {
                        return reject(error)
                    }
                    return resolve(newDoc)
                })
            })
        },
        findById (id) {
            return new Promise((resolve, reject) => {
                db.findOne({ [this.$idField]: id }).exec((error, docs) => {
                    if (error) {
                        return reject(error)
                    }
                    return resolve(docs)
                })
            })
        },
        find (params) {
            return new Promise((resolve, reject) => {
                const query = params.query || {}

                let q = db.find(query)

                if (query[this.$idField]) {
                    // query[this.$idField] = stringToObjectID(query[this.$idField])
                }

                if (params.limit) {
                    q = q.limit(Number(params.limit))
                }

                if (params.offset) {
                    q = q.skip(params.offset)
                }

                if (params.sort) {
                    q = q.sort(params.sort)
                }

                q.exec((error, docs) => {
                    if (error) {
                        return reject(error)
                    }
                    return resolve(docs)
                })
            })
        },
        updateById (id, entity) {
            return db.get(model).find({ id }).assign(entity).write()
        },
        removeById (id) {
            return db.get(model).remove({ id }).write()
        }
    }
}

module.exports = WeaveDbAdapter
