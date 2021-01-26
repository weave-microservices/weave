export function isStream(obj: any): boolean {
  return obj && obj.readable === true && typeof obj.on === 'function' && typeof obj.pipe === 'function'
}
