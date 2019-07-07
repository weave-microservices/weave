const { runHttpQuery, convertNodeHttpToRequest } = require('apollo-server-core')
const url = require('url')

const setHeaders = (response, headers) => {
    Object.keys(headers).forEach(header => {
        response.setHeader(header, headers[header])
    })
}

module.exports = (options) => {
    if (!options) {
        throw new Error('pollo Server requires options.')
    }

    // if (arguments.length !== 1) {
    //     throw new Error(`Apollo Server expects exactly one argument, got ${arguments.length}`)
    // }

    return async (request, response) => {
        let query

        if (request.method === 'POST') {
            query = request.filePayload || request.body
        } else {
            query = url.parse(request.url, true).query
        }

        try {
            const { graphqlResponse, responseInit } = await runHttpQuery([request, response], {
                method: request.method,
                options,
                query,
                request: convertNodeHttpToRequest(request)
            })

            setHeaders(response, responseInit.headers)
            return graphqlResponse
        } catch (error) {
            console.log(error)
        }
    }
}
