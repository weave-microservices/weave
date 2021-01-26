import tagTester from './helper/tag-tester'

export function isString(obj: any): boolean {
  return tagTester('String')(obj)
}

