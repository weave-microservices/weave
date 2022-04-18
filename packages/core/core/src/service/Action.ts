import { ActionHandler } from "./ActionHandler";
import { Service } from "./Service";

export type Action = {
  name: string;
  shortName: string;
  service: Service,
  version?: number;
  handler: ActionHandler;
}
