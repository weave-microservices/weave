
declare module "@weave-js/core" {
  interface ActionContracts {
    "greeter.hello": { 
        response: { type: any };
    };
"user.getUsers": { 
        response: { type: any };
    }
  }
}

export {}
