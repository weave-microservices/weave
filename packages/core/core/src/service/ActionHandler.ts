import { ActionContext } from "../broker/ActionContext";

export type ActionHandler = (context: ActionContext) => unknown;