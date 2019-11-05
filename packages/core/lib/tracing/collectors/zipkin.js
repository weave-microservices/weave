const BaseCollector = require('./base')
const fetch = require('node-fetch')

const convertTime = timestamp => timestamp != null ? Math.round(timestamp * 1000) : null
const convertId = id => id ? id.replace(/-/g, '').substring(0, 16) : null

class JaegerCollector extends BaseCollector {
    constructor (options) {
        super(options)

        this.options = Object.assign({
            host: process.env.ZIPKIN_URL || 'http://localhost:9411',
            endpoint: '/api/v2/spans',
            interval: 5000
        })

        this.queue = []
    }

    init (broker, tracer) {
        super.init(tracer)
        this.broker = broker
        this.timer = setInterval(() => this.flushQueue(), this.options.interval)
    }

    finishedSpan (span) {
        this.queue.push(span)
    }

    flushQueue () {
        if (this.queue.length) {
            const data = this.generatePayload()
            this.queue = []
            this.sendData(data)
        }
    }

    generatePayload () {
        return this.queue.map(span => {
            const serviceName = span.service ? span.service.fullyQualifiedName : null
            const zipkinPayloadObject = {
                id: convertId(span.id),
                traceId: convertId(span.traceId),
                parentId: convertId(span.parentId),
                name: span.name,
                kind: 'CONSUMER',
                localEndpoint: { serviceName },
                remoteEndpoint: { serviceName },
                timestamp: convertTime(span.startTime),
                duration: convertTime(span.duration),
                annotations: [
                    {
                        timestamp: convertTime(span.startTime),
                        value: 'sr'
                    },
                    {
                        timestamp: convertTime(span.finishTime),
                        value: 'ss'
                    }
                ],
                tags: {
                    'span.type': span.type
                }
            }

            if (span.error) {
                zipkinPayloadObject.tags.error = span.error.message
                zipkinPayloadObject.annotations.push({
                    value: 'error',
                    endpoint: {
                        serviceName: serviceName,
                        ipv4: '',
                        port: 0
                    },
                    timestamp: convertTime(span.finishTime)
                })
            }

            return zipkinPayloadObject
        })
    }

    sendData (data) {
        data = JSON.stringify(data)

        fetch(`${this.options.host}${this.options.endpoint}`, {
            method: 'post',
            body: data,
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        })
            .then(res => res.text())
            .then(res => {

            })
    }

    // generateTracePayload (span) {
    //     const payload = {
    //         id: context.id,
    //         nodeId: context.nodeId,
    //         level: context.level,
    //         isRemoteCall: !!context.callerNodeId,
    //         requestId: context.requestId,
    //         startTime: span.startTime
    //     }

    //     if (context.action) {
    //         payload.action = {
    //             name: context.action.name
    //         }
    //     }

    //     if (context.parentId) {
    //         payload.parentId = context.parentId
    //     }

    //     if (payload.isRemoteCall) {
    //         payload.callerNodeId = context.callerNodeId
    //     }

    //     return payload
    // }
/*

    const stopTime = context.startTime + context.duration

    if (context.tracing) {
        const payload = generateTracingBody(context)
        payload.stopTime = stopTime
        payload.isCachedResult = !!context.isCachedResult

        if (context.action) {
            payload.action = {
                name: context.action.name
            }
        }

        if (error) {
            payload.error = {
                name: error.name,
                code: error.code,
                type: error.type,
                message: error.message
            }
        }
        broker.emit('tracing.trace.span.finished', payload)
    }*/
}

module.exports = JaegerCollector
