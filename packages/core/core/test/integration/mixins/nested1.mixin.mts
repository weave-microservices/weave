import nested2 from './nested2.mixin.mts';

export default () => {
  return {
    mixins: [nested2()],
    actions: {
      a () {}
    }
  };
};
