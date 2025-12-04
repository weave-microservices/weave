import nested3 from "./nested3.mixin.mts";

export default () => {
  return {
    mixins: [nested3()],
    actions: {
      b() {},
    },
  };
};
