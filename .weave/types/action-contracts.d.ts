declare module "@weave-js/core" {
  interface ActionContracts {
    "internal.makeSomethingInternal": {
      params: {
        email: string;
        settings: {
          enabled: boolean;
          timeout: number;
          internalSettings: {
            enabled: boolean;
            timeout: number;
          };
        };
      };
      response: { type: any };
    };
    "test.hello": {
      params: {
        name: string;
        age: number;
      };
      response: { type: any };
    };
    "external.makeSomething": {
      params: {
        email: string;
        settings: {};
      };
      response: { type: any };
    };
  }
}

export {};
