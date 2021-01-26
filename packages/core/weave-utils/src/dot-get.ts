export function dotGet(object: Object, key: string): any {
  if (key.includes('.')) {
    return key.split('.').reduce((obj, i) => obj[i], object)
  }

  return object[key]
}
