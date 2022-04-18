import { EventContext } from "../broker/EventContext";

export type EventHandler = (context: EventContext) => Promise<any>;