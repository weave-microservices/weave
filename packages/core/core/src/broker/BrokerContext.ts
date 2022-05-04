import { Runtime } from "../runtime/Runtime";

class BrokerContext {

  constructor (
    protected readonly runtime: Runtime
  ) {
  }
}

export { BrokerContext }