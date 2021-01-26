export function delay (ms: number): Promise<any> {
  return new Promise(_ => setTimeout(_, ms))
}
