export function compact(array: Array<any>): Array<any> {
  return array.filter(Boolean)
}
