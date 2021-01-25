import { Logger } from "./logger.interface";
import { Middleware } from "./middleware.interface";
export interface Cache {
    name?: string;
    options: any;
    init(): void;
    log: Logger;
    set(hashKey: string, result: any, ttl?: number): Promise<any>;
    get(hashKey: string): Promise<any>;
    remove(hashKey: string): Promise<any>;
    clear(patter: string): Promise<any>;
    getCachingHash(actionName: string, params: any, meta: any, keys: Array<string>): string;
    createMiddleware(): Middleware;
    stop(): Promise<any>;
}
