declare module "@weave-js/core" {
  interface ActionContracts {
    "test.hello": {
      params: { name: string; age: number };
      response: { type: string };
    };
    "external.makeSomething": {
      params: { email: string; settings: { enabled: boolean; timeout: number } };
      response: { type: any };
    };
  }
}

export {};
