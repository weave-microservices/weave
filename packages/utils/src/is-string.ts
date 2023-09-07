import { tagTester } from './helper/tag-tester';

export function isString(obj: any) {
  return tagTester('String', obj);
} 

