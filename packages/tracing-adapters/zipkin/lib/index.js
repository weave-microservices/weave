const { createBaseTracingCollector } = require('@weave-js/core')
const fetch = require('node-fetch')

const convertTime = timestamp => timestamp != null ? Math.round(timestamp * 1000) : null
const convertId = id => id ? id.replace(/-/g, '').substring(0, 16) : null

const mergeDefaultOptions = (options) => {
  return Object.assign({
    host: process.env.ZIPKIN_URL || 'http://localhost:9411',
    endpoint: '/api/v2/spans',
    interval: 5000
  }, options)
}

exports.createZipkinExporter = (options) =>
  (runtime, tracer) => {
    const exporter = createBaseTracingCollector(runtime, tracer)
    const queue = []

    options = mergeDefaultOptions(options)

    let timer = setInterval(() => flushQueue(), options.interval)

    const flushQueue = () => {
      if (queue.length) {
        const data = generatePayload()
        queue.length = 0
        sendData(data)
      }
    }

    const generatePayload = () => {
      return queue.map(span => {
        const serviceName = span.service ? span.service.fullyQualifiedName : null

        const payload = {
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
          payload.tags.error = span.error.message
          payload.annotations.push({
            value: 'error',
            endpoint: {
              serviceName: serviceName,
              ipv4: '',
              port: 0
            },
            timestamp: convertTime(span.finishTime)
          })
        }

        Object.assign(
          payload.tags,
          exporter.flattenTags(span.tags, true)
        )

        return payload
      })
    }

    const sendData = (data) => {
      data = JSON.stringify(data)

      fetch(`${options.host}${options.endpoint}`, {
        method: 'post',
        body: data,
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': data.length
        }
      })
        .then(res => res.text())
        .catch(err => console.log(err))
    }

    exporter.finishedSpan = (span) => {
      queue.push(span)
    }

    exporter.stop = async () => {
      if (timer) {
        clearInterval(timer)
        timer = null
      }
    }

    return exporter
  }
