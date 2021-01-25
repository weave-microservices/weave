import type { EventEmitter2 } from "eventemitter2";

declare global {
  namespace NodeJS {
    interface Global {
      // Reference our above type, this allows global.debug to be
      // to be defined in our code.
      bus: EventEmitter2; 
    }
  }
}
