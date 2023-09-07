export function tagTester (name: string, obj: object): boolean {
  return Object.prototype.toString.call(obj) === '[object ' + name + ']';
};
