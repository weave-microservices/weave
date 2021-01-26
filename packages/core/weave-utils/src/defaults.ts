import { isObject } from './is-object'
import { compact } from './compact'
import { clone } from './clone'

export function defaultsDeep(...objects: any[]): any {
  const length = objects.length
  const target = Object(objects[0])

  if (length < 2 || target == null) {
    return target
  }

  for (let index = 1; index < length; index++) {
    const source = objects[index]

    if (!source) {
      continue
    }

    const keys = Object.keys(source)
    const le = keys.length

    for (let i = 0; i < le; i++) {
      const key = keys[i]

      if (target[key] === undefined && source[key] !== undefined) {
        target[key] = source[key]
      } else if (isObject(target[key])) {
        const params = compact([target[key], source[key]])
        target[key] = defaultsDeep(...params)
      }
    }
  }

  return target
}
