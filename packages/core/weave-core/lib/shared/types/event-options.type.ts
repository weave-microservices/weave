import { Context } from "../interfaces/context.interface";

export type EventOptions = {
    parentContext?: Context,
    groups?: Array<string>
}