export function wrapInArray(object: any): any[] {
  return Array.isArray(object) ? object : [object];
}
