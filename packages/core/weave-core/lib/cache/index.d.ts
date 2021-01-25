import Memory from './memory';
declare const adapters: {
    Memory: typeof Memory;
};
export { adapters };
export { createCacheBase } from './base';
export declare function resolve(cacheOptions: any): any;
