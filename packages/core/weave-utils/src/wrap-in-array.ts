export function wrapInArray(object){
  return Array.isArray(object) ? object : [object]
}
