export interface Logger {
    [key: string]: (...messageObject: any[]) => {};
}
