import { isObject } from './is-object';

// Names of properties in T with types that include undefined
type OptionalPropertyNames<T> = { [K in keyof T]: undefined extends T[K] ? K : never }[keyof T];

// Common properties from L and R with undefined in R[K] replaced by type in L[K]
type SpreadProperties<L, R, K extends keyof L & keyof R> = { [P in K]: L[P] | Exclude<R[P], undefined> };

type Id<T> = T extends infer U ? { [K in keyof U]: U[K] } : never // see note at bottom*

// Type of { ...L, ...R }
type Spread<L, R> = Id<
  // Properties in L that don't exist in R
  & Pick<L, Exclude<keyof L, keyof R>>
  // Properties in R with types that exclude undefined
  & Pick<R, Exclude<keyof R, OptionalPropertyNames<R>>>
  // Properties in R, with types that include undefined, that don't exist in L
  & Pick<R, Exclude<OptionalPropertyNames<R>, keyof L>>
  // Properties in R, with types that include undefined, that exist in L
  & SpreadProperties<L, R, OptionalPropertyNames<R> & keyof L>
>;

type IsObject<T> = T extends object ? T extends any[] ? false : true : false;


type Merge2<T, U> = IsObject<T> & IsObject<U> extends true ? {
  [K in keyof T]: K extends keyof U ? Merge2<T[K], U[K]> : T[K];
} & U : U;

export function merge<A extends Record<string, any>, B extends Record<string, any>>(target: A, source: B): Merge2<A, B> | B {
  if (!isObject(target) || !isObject(source)) {
    return source;
  }

  const tempTarget = Object.assign({}, target) as A;

  Object.keys(source).forEach((key) => {
    const targetValue = tempTarget[key];
    const sourceValue = source[key];

    if (Array.isArray(targetValue) && Array.isArray(sourceValue)) {
      Object.assign(tempTarget, { [key]: targetValue.concat(sourceValue) });
    } else if (isObject(targetValue) && isObject(sourceValue)) {
      Object.assign(tempTarget, { [key]: merge(Object.assign({}, targetValue), sourceValue) });
    } else {
      Object.assign(tempTarget, { [key]: sourceValue });
    }
  });

  return tempTarget as Merge2<A, B>;
};

export function deepMerge (...args: Record<string, any>[]) {
  // Setup target object
  const newObj = {};

  // Merge the object into the newObj object
  const merge = function (obj) {
    for (const prop in obj) {
      if (obj.hasOwnProperty(prop)) {
        // If property is an object, merge properties
        if (Object.prototype.toString.call(obj[prop]) === '[object Object]') {
          newObj[prop] = deepMerge(newObj[prop], obj[prop]);
        } else if (Array.isArray(newObj[prop]) && Array.isArray(obj[prop])) {
          newObj[prop] = newObj[prop].concat(obj[prop]);
        } else {
          newObj[prop] = obj[prop];
        }
      }
    }
  };

  // Loop through each object and conduct a merge
  for (let i = 0; i < args.length; i++) {
    merge(args[i]);
  }

  return newObj;
};
