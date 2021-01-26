export function omit (obj: any, fields: Array<string>): any {
  if (obj === null) {
    return null
  }

  const shallowCopy = Object.assign({}, obj)

  for (let i = 0; i < fields.length; i++) {
    const key = fields[i]
    delete shallowCopy[key]
  }

  return shallowCopy
}
