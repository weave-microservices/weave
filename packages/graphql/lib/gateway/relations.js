// const { ApolloLink, Observable } = require('apollo-link')
// const { print } = require('graphql/language/printer')
const selectn = require('selectn')

const getArgs = (relationship, props) => {
    if (!relationship.args) return {}
    const computedArgs = {}
    for (const arg of Object.keys(relationship.args)) {
        computedArgs[arg] = selectn(relationship.args[arg], props)
    }
    return computedArgs
}

const getFieldResolvers = (relationDefinitions, mergeInfo) => {
    const relationshipResolvers = {}
    for (const fieldName of Object.keys(relationDefinitions)) {
        const definition = relationDefinitions[fieldName]
        relationshipResolvers[fieldName] = {
            resolve (parent, args, context, info) {
                return mergeInfo.delegate(
                    definition.type,
                    definition.operationName,
                    getArgs(definition, { parent, args, context, info }),
                    context,
                    info
                )
            }
        }
    }
    return relationshipResolvers
}

module.exports = (typeDefinitions, validatedRelationalTypes) => {
    return mergeInfo => {
        const typeResolvers = {}
        for (const type of Object.keys(typeDefinitions)) {
            if (validatedRelationalTypes && !validatedRelationalTypes.includes(type)) continue
            typeResolvers[type] = getFieldResolvers(typeDefinitions[type], mergeInfo)
        }
        return typeResolvers
    }
}
