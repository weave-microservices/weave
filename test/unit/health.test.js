const { getNodeHealthInfo } = require('../../lib/health')

describe('Health status methods', () => {
    it('should return health status.', () => {
        const health = getNodeHealthInfo({})

        // os
        expect(health.os).toBeDefined()
        expect(health.os.hostname).toBeDefined()
        expect(health.os.pattform).toBeDefined()
        expect(health.os.release).toBeDefined()
        expect(health.os.type).toBeDefined()

        // cpu
        expect(health.cpu.cores).toBeDefined()
        expect(health.cpu.utilization).toBeDefined()

        // memory
        expect(health.memory.freeMemory).toBeDefined()
        expect(health.memory.totalMemory).toBeDefined()

        // process
        expect(health.process.memory.heapTotal).toBeDefined()
        expect(health.process.memory.heapUsed).toBeDefined()
        expect(health.process.memory.rss).toBeDefined()
        expect(health.process.pid).toBeDefined()
        expect(health.process.uptime).toBeDefined()

        // client
        expect(health.client.langVersion).toBeDefined()
        expect(health.client.type).toBeDefined()
        expect(health.client.version).toBeDefined()

        // todo: add trasport informations
    })
})
