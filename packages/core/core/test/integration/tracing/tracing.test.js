// const { omit } = require('@weave-js/utils')
const { TracingAdapters } = require('../../../lib/index');
const { createNode } = require('../../helper');
const { posts, users } = require('../../helper/data');

// const pickSpanFields = (spans, fieldsToOmit = []) => {
//   return spans.map(span => {
//     span = omit(span, ['startTime', 'duration', 'finishTime'])
//     return span
//   })
// }
jest.useFakeTimers({ advanceTimers: true });

describe('Test tracing', () => {
  let flow = [];
  let id = 0;

  const defaultSettings = {
    logger: {
      enabled: false
    },
    transport: {
      adapter: 'dummy'
    },
    tracing: {
      enabled: true,
      collectors: [
        TracingAdapters.Event({
          interval: 1
        })
      ]
    },
    uuidFactory (runtime) {
      return `${runtime.nodeId}-${++id}`;
    }
  };

  const node1 = createNode(Object.assign({ nodeId: 'node1' }, defaultSettings), [{
    name: 'tracing-collector',
    events: {
      '$tracing.trace.spans' (ctx) {
        flow.push(...ctx.data);
      }
    }
  }]);

  const node2 = createNode(Object.assign({ nodeId: 'node2' }, defaultSettings), [{
    name: 'post',
    actions: {
      list (context) {
        const copiedPosts = JSON.parse(JSON.stringify(posts));
        return Promise.all(copiedPosts.map(async post => {
          post.author = await context.call('user.get', { id: post.author });
          return post;
        }));
      }
    }
  }]);

  const node3 = createNode(Object.assign({ nodeId: 'node3' }, defaultSettings), [{
    name: 'user',
    actions: {
      get (context) {
        const user = users.find(user => user.id === context.data.id);
        return user;
      }
    }
  }]);

  const node4 = createNode(Object.assign({ nodeId: 'node4' }, defaultSettings), [{
    name: 'friends'
  }]);

  node2.createService({
    name: 'test',
    actions: {
      hello (context) {
        return 'Hello';
      }
    }
  });

  beforeAll(() => {
    return Promise.all([
      node1.start(),
      node2.start(),
      node3.start(),
      node4.start()
    ]);
  });

  afterAll(() => Promise.all([
    node1.stop(),
    node2.stop(),
    node3.stop(),
    node4.stop()
  ]));

  afterEach(() => {
    flow = [];
    id = 0;
  });

  it('Started and finished event should be triggered.', async () => {
    await node1.waitForServices(['post', 'user', 'friends']);
    const result = await node2.call('post.list');
    jest.advanceTimersByTime(1000);

    expect(result).toMatchSnapshot();

    flow.sort((a, b) => a.startTime - b.startTime);
  });
});

describe('Test tag handling for spans', () => {
  let flow = [];
  let id = 0;

  const defaultSettings = {
    logger: {
      enabled: false
    },
    transport: {
      adapter: 'dummy'
    },
    tracing: {
      enabled: true,
      collectors: [
        TracingAdapters.Event({
          interval: 1
        })
      ]
    },
    uuidFactory (runtime) {
      return `${runtime.nodeId}-${++id}`;
    }
  };

  const node1 = createNode(Object.assign({ nodeId: 'node-link-1' }, defaultSettings), [{
    name: 'user',
    events: {
      '$tracing.trace.spans' (ctx) {
        flow.push(...ctx.data);
      }
    },
    actions: {
      get: {
        tracing: {
          tags: {
            data: ['id'],
            response: ['name']
          }
        },
        async handler (context) {
          const user = users.find(user => user.id === context.data.id);
          return user;
        }
      }
    }
  }]);

  const node2 = createNode(Object.assign({ nodeId: 'node-link-2' }, defaultSettings), [{
    name: 'post',
    actions: {
      list: {
        tracing: {
          tags: {
            response: true
          }
        },
        async handler (context) {
          const copiedPosts = JSON.parse(JSON.stringify(posts));
          return Promise.all(copiedPosts.map(async (post) => {
            post.author = await context.call('user.get', { id: post.author });
            return post;
          }));
        }
      }
    }
  }]);

  node1.createService({
    name: 'from-service',
    actions: {
      departure (context) {
        return 'Hello';
      }
    }
  });

  node1.createService({
    name: 'to-service',
    actions: {
      destination (context) {
        return 'Hello';
      }
    }
  });

  beforeAll(() => {
    return Promise.all([
      node1.start(),
      node2.start()
    ]);
  });

  afterAll(() => Promise.all([
    node1.stop(),
    node2.stop()
  ]));

  afterEach(() => {
    flow = [];
    id = 0;
  });

  it('Should link spans over context', async () => {
    await node1.waitForServices(['post']);
    await node2.call('post.list');
    jest.advanceTimersByTime(1000);
    const userGetActions = flow.filter(span => span.name === 'action "user.get"');
    const postListAction = flow.filter(span => span.name === 'action "post.list"');

    expect(userGetActions.length).toBe(3);
    expect(postListAction.length).toBe(1);
  });

  it('Should create tags from data object', async () => {
    await node1.waitForServices(['post']);
    await node2.call('post.list');
    jest.advanceTimersByTime(1000);
    const userGetActions = flow.filter(span => span.name === 'action "user.get"');
    const postListAction = flow.filter(span => span.name === 'action "post.list"');

    const idsFromTags = userGetActions.map(span => span.tags.data.id).sort();

    expect(idsFromTags).toEqual([1, 2, 3]);

    expect(userGetActions.length).toBe(3);
    expect(postListAction.length).toBe(1);
  });

  it('Should create tags from complete response', async () => {
    await node1.waitForServices(['post']);
    const result = await node2.call('post.list');
    jest.advanceTimersByTime(1000);
    const postListAction = flow.filter(span => span.name === 'action "post.list"');

    const postResultFromTags = postListAction[0];
    expect(postListAction.length).toBe(1);
    expect(Object.assign({}, result)).toEqual(postResultFromTags.tags.response);
  });

  it('Should create tags from response object properties', async () => {
    await node1.waitForServices(['post']);
    await node2.call('post.list');
    jest.advanceTimersByTime(1000);
    const userGetActions = flow.filter(span => span.name === 'action "user.get"');

    const namesFromTags = userGetActions.map(span => span.tags.response.name).sort();

    expect(namesFromTags).toEqual(['Hank Schrader', 'Jesse Pinkman', 'Walter White']);
  });
});
