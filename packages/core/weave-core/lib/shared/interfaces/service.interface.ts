import { Broker } from "./broker.interface";

export interface Service {
  filename: string,
  broker: Broker,
  log: Logger,
  version?: number,
  name: string,
  meta?: Object,
  fullyQualifiedName: string,
  schema: Object, // todo: schema
  settings: ServiceSettings,
  actions?: { [key: string]: (data: Object, options: ActionOptions) => {} },
  events?: { [key: string]: (context: Context) => {} },
  methods?: { [key: string]: Function } ,
  start(): Promise<any>,
  stop(): Promise<any>
}