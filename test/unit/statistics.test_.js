const Weave = require('../../lib')
const Statistics = require('../../lib/statistics')

describe('statistic services', () => {
    let weave
    beforeEach(() => {
        weave = Weave()
    })
    it('should return health status.', () => {
        const stats = Statistics(weave)
        expect(stats.addRequest).toBeDefined()
        expect(stats.addRequest).toBeDefined()

        // todo: add trasport informations
    })
})
