
declare module "@weave-js/core" {
  interface ActionContracts {
    "test.hello": { 
        params: { name: string; age: number };
response: { type: string };
    };
"external.makeSomething": { 
        response: { type: any };
    }
  }
}

export {}
