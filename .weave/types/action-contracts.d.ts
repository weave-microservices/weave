declare module "@weave-js/core" {
  interface ActionContracts {
    "test.hello": {
      params: {
        name: string;
      };
      response: { type: any };
    };
  }
}

export {};
