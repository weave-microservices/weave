export const name: string;
export namespace actions {
    namespace add {
        namespace cache {
            const keys: string[];
        }
        namespace params {
            const a: string;
            const b: string;
        }
        function handler(context: any): number;
        function handler(context: any): number;
    }
    namespace round {
        export namespace cache_1 {
            const keys_1: string[];
            export { keys_1 as keys };
        }
        export { cache_1 as cache };
        export namespace params_1 {
            const value: string;
        }
        export { params_1 as params };
        export function handler(context: any): number;
        export function handler(context: any): number;
    }
}
