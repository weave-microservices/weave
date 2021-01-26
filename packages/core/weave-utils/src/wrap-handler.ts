import { isFunction } from './is-function'

export function wrapHandler(action) {
  return isFunction(action) ? { handler: action } : action
}
