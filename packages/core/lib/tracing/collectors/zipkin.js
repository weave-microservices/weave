const BaseCollector = require('./base')
const fetch = require('fetch')

const convertTime = timestamp => timestamp != null ? Math.round(timestamp * 1000) : null

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

        /**{
            "id": "352bff9a74ca9ad2",
            "traceId": "5af7183fb1d4cf5f",
            "parentId": "6b221d5bc9e6496c",
            "name": "get /api",
            "timestamp": 1556604172355737,
            "duration": 1431,
            "kind": "SERVER",
            "localEndpoint": {
                "serviceName": "backend",
                "ipv4": "192.168.99.1",
                "port": 3306
            },
            "remoteEndpoint": {
                "ipv4": "172.19.0.2",
                "port": 58648
            },
            "tags": {
                "http.method": "GET",
                "http.path": "/api"
            }
        } */
        return this.queue.map(span => {
            const zipkinPayloadObject = {
                id: span.id,
                traceId: span.traceId,
                name: span.name,
                kind: 'CONSUMER',
                timestamp: convertTime(span.startTime),
                duration: convertTime(span.duration),
                tags: {
                    'span.type': span.type
                }
            }
            

            return zipkinPayloadObject
        })
    }

    sendData (data) {
        data = JSON.stringify(data)

        fetch(`${this.options.host}${this.options.endpoint}`, {
            method: 'post',
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        }).then(res => {

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
