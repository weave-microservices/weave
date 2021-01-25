export declare function createContextFactory(): {
    init(broker: any): void;
    create(endpoint: any, data: any, opts: any): import("../shared/interfaces/context.interface").Context;
    createEventContext(endpoint: any, data: any, opts: any): import("../shared/interfaces/context.interface").Context;
};
