export function flatten(arr: any[]): any[] {
  return arr.reduce((a, b) => a.concat(b), []); 
}
