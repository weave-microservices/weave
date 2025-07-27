type PathImpl<T, K extends keyof T> =
  K extends string
  ? T[K] extends Record<string, any>
    ? T[K] extends ArrayLike<any>
      ? K | `${K}.${PathImpl<T[K], Exclude<keyof T[K], keyof any[]>>}`
      : K | `${K}.${PathImpl<T[K], keyof T[K]>}`
    : K
  : never;

type Path<T> = PathImpl<T, keyof T> | keyof T;
type SetPath<T, V> = PathImpl<T, keyof T> | keyof T;

type PathValue<T, P extends Path<T>> =
  P extends `${infer K}.${infer Rest}`
    ? K extends keyof T
      ? Rest extends Path<T[K]>
        ? PathValue<T[K], Rest>
        : never
      : never
    : P extends keyof T
  ? T[P]
  : never;

type CPUUsage = {
  avg: number,
  usages: number[]
}

type DebounceCallback = (...args: any[]) => void;

type Handler = {
  handler: (context: any) => any
}

// Module exports
declare const utils: {
  /** Convert bytes to human-readable string with appropriate units */
  bytesToSize(bytes: number): string;
  
  /** Capitalize the first letter of a string */
  capitalize(str: string): string;
  
  /** Clone an object recursively */
  clone<T>(obj: T): T;
  
  /** Remove null and undefined values from an array */
  compact<T>(arr: (T | null | undefined)[]): T[];
  
  /** Get CPU usage statistics for all CPU cores over a sampling period */
  cpuUsage(sampleTime?: number): Promise<CPUUsage>;
  
  /** Creates a debounced function that delays invoking func until after wait milliseconds */
  debounce(callback: DebounceCallback, delay: number): DebounceCallback;
  
  /** Deep merge multiple objects, with later objects overriding earlier ones */
  defaultsDeep<T>(...objects: Partial<T>[]): T;
  
  /** Delay async execution by specified milliseconds */
  delay(ms: number): Promise<void>;
  
  /** Get a value from an object using dot notation path */
  dotGet<T>(obj: any, path: string): T;
  
  /** Set a value in an object using dot notation path */
  dotSet<T>(obj: any, path: string, value: T): void;
  /** Create a new EventEmitter instance */
  createEventEmitter(): any;
  
  /** Flatten an array of arrays into a single array (one level deep) */
  flatten<T>(arr: any[]): T[];
  
  /** Deep flatten nested arrays into a single array */
  flattenDeep<T>(arr: any[]): T[];
  
  /** Get a list of IPv4 addresses from all network interfaces */
  getIpList(): string[];
  
  /** Check if a value is a function */
  isFunction(obj: any): obj is Function;
  
  /** Check if a string is valid JSON */
  isJSONString(str: string): boolean;
  
  /** Check if a value is an object */
  isObject(obj: any): obj is object;
  
  /** Check if a value is a plain object (not array, function, etc.) */
  isPlainObject(obj: any): obj is Record<string, any>;
  
  /** Check if a Node.js stream is in object mode */
  isStreamObjectMode(stream: any): boolean;
  
  /** Check if a value is a stream */
  isStream(obj: any): boolean;
  
  /** Check if a value is a string */
  isString(obj: any): obj is string;
  
  /** Test if text matches a pattern */
  match(pattern: string | RegExp, text: string): boolean;
  
  /** Merge objects shallowly */
  merge<T>(...objects: Partial<T>[]): T;
  
  /** Deep merge objects recursively */
  deepMerge<T>(...objects: Partial<T>[]): T;
  
  /** Create new object with specified keys omitted */
  omit<T, K extends keyof T>(obj: T, keys: K[]): Omit<T, K>;
  
  /** Delay promise resolution by specified milliseconds */
  promiseDelay(ms: number): Promise<void>;
  
  /** Add timeout to a promise */
  promiseTimeout<T>(promise: Promise<T>, ms: number): Promise<T>;
  
  /** Convert callback-style function to promise-based */
  promisify<T extends Function>(fn: T): T;
  
  /** Create a random string of specified length */
  createRandomString(length?: number): string;
  
  /** Remove elements from array by predicate and return removed elements */
  remove<T>(arr: T[], predicate: (item: T) => boolean): T[];
  
  /** Create a safe copy of an object */
  safeCopy<T>(obj: T): T;
  
  /** Format time span as human-readable string */
  timespanFromUnixTimes(startTime: number, endTime: number): string;
  
  /** Format time span as short human-readable string */
  timespanFromUnixTimesShort(startTime: number, endTime: number): string;
  
  /** Generate a UUID string */
  uuid(): string;
  
  /** Wrap a handler function with error handling */
  wrapHandler(handler: Handler): Handler;
  
  /** Wrap a value in an array if it's not already an array */
  wrapInArray<T>(item: T | T[]): T[];
  
  /** Create new object with only specified keys */
  pick<T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K>;
};

export = utils;