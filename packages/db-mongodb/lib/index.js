/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2018 Fachwerk
 */

const { MongoClient, ObjectID } = require('mongodb')
const { defaultsDeep } = require('lodash')

function MongoDbAdapter (options) {
    let transformer

    options = defaultsDeep(options, {
        transform: true
    })

    function transform (entity) {
        return new Promise((resolve, reject) => {
            if (!transformer) return resolve(entity)
            return resolve(transformer.transform(entity))
        })
    }

    function stringToObjectID (value) {
        if (typeof value === 'string') {
            return new ObjectID(value)
        }
        return value
    }

    return {
        init (broker, service) {
            if (!service.schema.collectionName) {
                throw new Error('Collection name is missing!')
            }

            this.$service = service
            this.$collectionName = service.schema.collectionName
            this.$idField = service.schema.settings.idField || '_id'

            this.log = broker.getLogger('MONGODB')
        },
        connect () {
            return MongoClient.connect(options.url, options.options).then(client => {
                // if (typeof model.init === 'function') {
                //     model.init(db)
                // }

                this.db = this.$service.db = client.db ? client.db(options.database) : client
                this.collection = this.$service.db.collection(this.$collectionName)

                this.log.debug('Successfull connected!')
                return { dbInstance: this.db }
            })
        },
        disconnect () {
            return new Promise((resolve, reject) => {
                this.db.close((error) => {
                    if (error) return reject(error)
                    return resolve()
                })
            })
        },
        count (filterParams) {
            filterParams = filterParams || {}
            return this.collection
                        .find(filterParams)
                        .count()
        },
        insert (entity) {
            return Promise.resolve(entity)
                    .then(ent => transform(ent))
                    .then(entity => this.collection.insert(entity))
        },
        findById (id) {
            return this.collection
                .findOne({ [this.$idField]: stringToObjectID(id) })
        },
        findByIds (ids) {
            return this.collection
                .find({ [this.$idField]: { $in: ids.map(id => stringToObjectID(id)) }})
                .toArray()
        },
        find (params) {
            return new Promise((resolve, reject) => {
                const buffer = []
                const query = params.query || {}

                if (query[this.$idField]) {
                    query[this.$idField] = stringToObjectID(query[this.$idField])
                }

                let q = this.collection
                    .find(query, params.projection)

                if (params.limit) {
                    q = q.limit(Number(params.limit))
                }

                if (params.offset) {
                    q = q.skip(params.offset)
                }

                if (params.sort) {
                    q = q.sort(params.sort)
                }
                const stream = q.stream()

                stream.on('data', (data) => {
                    buffer.push(data)
                })
                stream.on('end', (data) => {
                    return resolve(buffer)
                })
                stream.on('error', (error) => {
                    return reject(error)
                })
            })
        },
        findAllStream (query, filterOptions = {}) {
            return new Promise((resolve, reject) => {
                let q = this.collection.find(query)

                if (filterOptions.$limit) {
                    q = q.limit(Number(filterOptions.$limit))
                }
                if (filterOptions.$skip) {
                    q = q.skip(Number(filterOptions.$skip))
                }
                if (filterOptions.$sort) {
                    q = q.sort(filterOptions.$sort)
                }
                const stream = q.stream()
                return resolve(stream)
            })
        },
        updateById (id, entity) {
            return Promise.resolve(entity)
                .then(entity => transform(entity))
                .then(entity => this.collection.updateOne({ [this.$idField]: new ObjectID(id) }, entity))
        },
        removeById (id) {
            return this.collection
                .remove({ [this.$idField]: stringToObjectID(id) })
        },
        close () {
            return this.db.close()
        }
    }
}

module.exports = MongoDbAdapter
