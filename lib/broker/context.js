const utils = require('../utils')
const makeContext = ({ state, transport, call, emit, options, bus, shouldCollectMetrics }) =>
    action => {
        return {
            id: null,
            state,
            nodeId: state.nodeId || null,
            callerNodeId: null,
            params: null,
            meta: {},
            timeout: 0,
            retryCount: 0,
            level: 0,
            metrics: false,
            action,
            startTime: null,
            startHighResolutionTime: null,
            duration: 0,
            stopTime: 0,
            setParams (newParams) {
                this.params = newParams || {}
            },
            generateId () {
                this.id = utils.generateToken()
            },
            emit (eventName, payload) {
                return emit(eventName, payload, state.nodeId)
            },
            call (actionName, params, options = {}) {
                options.parentContext = this
                return call(actionName, params, options)
            },
            metricsStart () {
                this.startTime = Date.now()
                this.startHighResolutionTime = process.hrtime()
                const payload = {
                    action: {
                        name: this.action.name
                    },
                    startTime: this.startTime
                }
                emit('metrics.trace.started', payload)
            },
            metricsFinish (error, emitEvent) {
                if (this.startHighResolutionTime) {
                    const diff = process.hrtime(this.startHighResolutionTime)
                    this.duration = (diff[0] * 1e3) + (diff[1] / 1e6) // ms
                }
                const stopTime = this.startTime + this.duration
                if (emitEvent) {
                    const payload = {
                        action: {
                            name: this.action.name
                        },
                        requestId: this.id,
                        isRemoteCall: !!this.callerNodeId,
                        isFromCache: this.cachedResult,
                        stopTime,
                        duration: this.duration
                    }
                    if (error) {
                        payload.error = {
                            name: error.name,
                            code: error.code,
                            type: error.type,
                            message: error.message
                        }
                    }
                    emit('metrics.trace.finished', payload)
                }
            }
        }
    }

module.exports = makeContext
