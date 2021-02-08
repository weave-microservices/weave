const utils = require('../lib')

describe('Set properties by dot seperated path', () => {
  it('should set a property', () => {
    const source = {
      name: 'test',
      settings: {
        a: 100,
        endpoints: {
          http: true,
          tcp: false,
          ws: [1, 2, 3]
        }
      }
    }

    utils.dotSet(source, 'name', 'newName')
    expect(source.name).toBe('newName')

    utils.dotSet(source, 'settings.a', 200)
    expect(source.settings.a).toBe(200)

    utils.dotSet(source, 'settings.b', 1002)
    expect(source.settings.b).toBe(1002)

    utils.dotSet(source, 'new_settings.b', 'test')
    expect(source.new_settings.b).toBe('test')
  })

  it('should throw an error if property path is not an object', () => {
    const source = {
      name: 'test',
      settings: {
        a: 100,
        endpoints: {
          http: true,
          tcp: false,
          ws: [1, 2, 3]
        }
      }
    }
    try {
      utils.dotSet(source, 'name.test', 'newName')
    } catch (error) {
      expect(error.message).toBe('The property "name" already exists and is not an object.')
    }
  })
})
