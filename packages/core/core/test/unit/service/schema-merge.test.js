const { mergeSchemas } = require('../../../lib/utils/options')

class TestClass {
  send () {
    return jest.fn()
  }
}

const mixin = {
  name: 'service2',
  meta: {
    $official: true,
    distributor: 'name'
  },
  settings: {
    queueSize: 6,
    protocol: 'http',
    credentials: {
      username: 'default',
      password: 'default'
    }
  },

  actions: {
    m2 () {},
    m3 () {}
  },
  events: {
    me1 () {},
    me2 () {}
  },
  created: jest.fn(),
  started: jest.fn()
}

const service1 = {
  name: 'service1',
  meta: {
    $official: true,
    packageName: 'test'
  },
  settings: {
    queueSize: 4,
    protocol: 'https',
    credentials: {
      username: 'John'
    },
    prototype: new TestClass()
  },
  hooks: {
    before: {
      a1: () => {}
    },
    after: {
      a3: () => {}
    }
  },
  actions: {
    a1 () {},
    a3: false
  },
  events: {
    e1 () {}
  },
  methods: {
    privateMethod1 () {}
  },
  created: jest.fn(),
  started: jest.fn(),
  stopped: jest.fn()
}

const service2 = {
  name: 'service2',
  mixins: [mixin],
  meta: {
    $official: true,
    distributor: 'name'
  },
  adapter: new TestClass(),
  settings: {
    queueSize: 6,
    protocol: 'http',
    credentials: {
      username: 'default',
      password: 'default'
    }
  },
  hooks: {
    before: {
      a2: () => {}
    },
    after: {
      a3: [
        () => {},
        () => {}
      ]
    }
  },
  actions: {
    a2 () {},
    a3 () {}
  },
  events: {
    e1 () {},
    e2 () {}
  },
  created: jest.fn(),
  started: jest.fn()
}

describe('Service schema merging', () => {
  it('shoud override the name', () => {
    const mergedService = mergeSchemas(service2, service1)
    expect(mergedService.name).toBe('service1')
  })

  it('shoud merge lifecycle hooks', () => {
    const mergedService = mergeSchemas(service2, service1)
    expect(Array.isArray(mergedService.created)).toBe(true)
    expect(Array.isArray(mergedService.started)).toBe(true)
    expect(Array.isArray(mergedService.stopped)).toBe(true)
    expect(mergedService.created.length).toBe(2)
    expect(mergedService.started.length).toBe(2)
    expect(mergedService.stopped.length).toBe(1)
  })

  it('shoud merge settings', () => {
    const mergedService = mergeSchemas(service2, service1)
    expect(Array.isArray(mergedService.started)).toBe(true)
    expect(mergedService.started.length).toBe(2)
  })

  it('shoud merge settings', () => {
    const mergedService = mergeSchemas(service2, service1)
    expect(mergedService.settings.queueSize).toBe(4)
    expect(mergedService.started.length).toBe(2)
  })

  it('shoud merge meta', () => {
    const mergedService = mergeSchemas(service2, service1)
    expect(mergedService.meta.$official).toBe(true)
    expect(mergedService.meta.distributor).toBe('name')
    expect(mergedService.meta.packageName).toBe('test')
  })

  it('shoud merge actions', () => {
    const mergedService = mergeSchemas(service2, service1)
    expect(mergedService.actions).toBeDefined()
    expect(mergedService.actions.a1).toBeDefined()
    expect(mergedService.actions.a2).toBeDefined()
    expect(mergedService.actions.a3).not.toBeDefined()
  })

  it('shoud merge events', () => {
    const mergedService = mergeSchemas(service2, service1)
    expect(mergedService.actions).toBeDefined()
    expect(mergedService.events.e1).toBeDefined()
    expect(Array.isArray(mergedService.events.e1.handler)).toBe(true)
    expect(mergedService.events.e2).toBeDefined()
  })

  it('shoud merge methods', () => {
    const mergedService = mergeSchemas(service2, service1)
    expect(mergedService.methods).toBeDefined()
    expect(mergedService.methods.privateMethod1).toBeDefined()
  })
})

describe('Hooks', () => {
  it('should merge schema hooks', () => {
    const mergedService = mergeSchemas(service2, service1)
    expect(mergedService.hooks.before).toBeDefined()
    expect(mergedService.hooks.before.a1).toBeDefined()
    expect(mergedService.hooks.before.a2).toBeDefined()
    expect(mergedService.hooks.after.a3).toBeDefined()
    expect(mergedService.hooks.after.a3.length).toBe(3)
    expect(mergedService.settings.prototype.send).toBeDefined()
    expect(typeof mergedService.settings.prototype.send).toBe('function')
  })
})

describe('dependencies', () => {
  it('should merge dependencies', () => {
    const service1 = {
      name: 'name1',
      dependencies: ['service3', 'service2']
    }

    const service2 = {
      name: 'name2',
      dependencies: ['service1', 'service3']
    }

    const service3 = {
      name: 'name3',
      dependencies: ['service1', 'service2']
    }

    const mergedSchema = mergeSchemas(service2, mergeSchemas(service3, service2))
  })
})
