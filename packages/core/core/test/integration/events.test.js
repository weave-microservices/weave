const { createNode } = require('../helper');

const isContext = () => {
  return true;
};

let flow = [];
const MixedService = {
  events: {
    'user.created' () {
      flow.push(`${this.broker.nodeId}-${this.name}-mixed.created`);
    }
  }
};

const UserService = {
  name: 'user',
  mixins: [MixedService],
  events: {
    'user.created' () {
      flow.push(`${this.broker.nodeId}-${this.name}-user.created`);
    },
    '$local.user.event' () {
      flow.push(`${this.broker.nodeId}-${this.name}-local.user.event`);
    }
  }
};

const PaymentService = {
  name: 'payment',
  events: {
    'user.created' () {
      flow.push(`${this.broker.nodeId}-${this.name}-user.created`);
    }
  }
};

const NotificationService = {
  name: 'notification',
  events: {
    'user.*' () {
      flow.push(`${this.broker.nodeId}-${this.name}-user.created`);
    }
    // 'user.created' () {
    //     flow.push(`${this.broker.nodeId}-${this.name}-user.created`)
    // }
  }
};

const OtherService = {
  name: 'other',
  events: {
    'other.thing' () {
      flow.push(`${this.broker.nodeId}-${this.name}-other.thing`);
    },
    'failed-event' () {
      flow.push(`${this.broker.nodeId}-${this.name}-failed-event`);
      throw new Error('This is a failed event');
    }
  }
};

const createNodes = (ns) => {
  const settings = {
    transport: {
      adapter: 'dummy'
    }
  };

  const mainNode = createNode(Object.assign({ namespace: ns, nodeId: 'master' }, settings));
  mainNode.createService(Object.assign({}, OtherService));
  mainNode.createService(Object.assign({}, OtherService, { name: 'other2' }));

  const userNode1 = createNode(Object.assign({ namespace: ns, nodeId: 'user-1' }, settings));
  userNode1.createService(Object.assign({}, UserService));
  userNode1.bus.on('$local.user.event', () => flow.push('userNode1-on-$local.user.event'));

  const userNode2 = createNode(Object.assign({ namespace: ns, nodeId: 'user-2' }, settings));
  userNode2.createService(Object.assign({}, UserService));

  const userNode3 = createNode(Object.assign({ namespace: ns, nodeId: 'user-3' }, settings));
  userNode3.createService(Object.assign({}, UserService));

  const paymentNode1 = createNode(Object.assign({ namespace: ns, nodeId: 'payment-1' }, settings));
  paymentNode1.createService(Object.assign({}, PaymentService));

  const paymentNode2 = createNode(Object.assign({ namespace: ns, nodeId: 'payment-2' }, settings));
  paymentNode2.createService(Object.assign({}, PaymentService));

  const paymentNode3 = createNode(Object.assign({ namespace: ns, nodeId: 'payment-3' }, settings));
  paymentNode3.createService(Object.assign({}, PaymentService));

  const notificationNode1 = createNode(Object.assign({ namespace: ns, nodeId: 'notification-1' }, settings));
  notificationNode1.createService(Object.assign({}, NotificationService));

  const notificationNode2 = createNode(Object.assign({ namespace: ns, nodeId: 'notification-2' }, settings));
  notificationNode2.createService(Object.assign({}, NotificationService));

  return [
    mainNode,
    userNode1,
    userNode2,
    userNode3,
    paymentNode1,
    paymentNode2,
    paymentNode3,
    notificationNode1,
    notificationNode2
  ];
};

describe('Event flow(remote)', () => {
  const nodes = createNodes('balanced');
  const master = nodes[0];
  const nodeUser1 = nodes[1];

  beforeAll(() => Promise.all(nodes.map(node => node.start())));
  afterAll(() => Promise.all(nodes.map(node => node.stop())));
  beforeEach(() => {
    flow = [];
  });

  it('should emit a event balanced (1).', () => {
    master.emit('user.created');
    expect(flow).toEqual([
      'user-1-user-user.created',
      'user-1-user-mixed.created',
      'payment-1-payment-user.created',
      'notification-1-notification-user.created'
    ]);
  });

  it('should emit a event. (2)', () => {
    master.emit('user.created');
    expect(flow).toEqual([
      'user-2-user-user.created',
      'user-2-user-mixed.created',
      'payment-2-payment-user.created',
      'notification-2-notification-user.created'
    ]);
  });

  it('should emit a event. (3)', () => {
    master.emit('user.created');
    expect(flow).toEqual([
      'user-3-user-user.created',
      'user-3-user-mixed.created',
      'payment-3-payment-user.created',
      'notification-1-notification-user.created'
    ]);
  });

  it('should not emit an event on local Bus.', () => {
    master.emit('$local.user.event');
    expect(flow).toEqual([
      'user-1-user-local.user.event'
    ]);
  });

  it('should emit a event on local Bus.', () => {
    nodeUser1.emit('$local.user.event');
    expect(flow).toEqual([
      'userNode1-on-$local.user.event',
      'user-1-user-local.user.event'
    ]);
  });

  it('should emit a event with group.', () => {
    master.emit('user.created', null, ['user']);
    expect(flow).toEqual([
      'user-1-user-user.created',
      'user-1-user-mixed.created'
    ]);
  });

  it('should emit a event with multiple groups.', () => {
    master.emit('user.created', null, ['user', 'notification']);
    expect(flow).toEqual([
      'user-2-user-user.created',
      'user-2-user-mixed.created',
      'notification-2-notification-user.created'
    ]);
  });

  it('should not emitted to lokal broker over transport', () => {});
});

describe('Broadcast events', () => {
  const nodes = createNodes('broadcast');
  const master = nodes[0];

  beforeAll(() => Promise.all(nodes.map(node => node.start())));
  afterAll(() => Promise.all(nodes.map(node => node.stop())));
  beforeEach(() => {
    flow = [];
  });

  it('should broadcast a event to all services.', () => {
    master.broadcast('user.created');
    expect(flow).toEqual([
      'user-1-user-user.created',
      'user-1-user-mixed.created',
      'user-2-user-user.created',
      'user-2-user-mixed.created',
      'user-3-user-user.created',
      'user-3-user-mixed.created',
      'payment-1-payment-user.created',
      'payment-2-payment-user.created',
      'payment-3-payment-user.created',
      'notification-1-notification-user.created',
      'notification-2-notification-user.created'
    ]);
  });

  it('should broadcast a event to services grouped by name.', () => {
    master.broadcast('user.created', null, ['user']);
    expect(flow).toEqual([
      'user-1-user-user.created',
      'user-1-user-mixed.created',
      'user-2-user-user.created',
      'user-2-user-mixed.created',
      'user-3-user-user.created',
      'user-3-user-mixed.created'
    ]);
  });

  it('should broadcast a event to services grouped by name.', () => {
    master.broadcast('user.created', null, ['user', 'payment']);
    expect(flow).toEqual([
      'user-1-user-user.created',
      'user-1-user-mixed.created',
      'user-2-user-user.created',
      'user-2-user-mixed.created',
      'user-3-user-user.created',
      'user-3-user-mixed.created',
      'payment-1-payment-user.created',
      'payment-2-payment-user.created',
      'payment-3-payment-user.created'
    ]);
  });
});

describe('Remote events', () => {
  let broker1;
  let broker2;
  const testEventS1 = jest.fn();
  const testEventS2 = jest.fn();

  beforeEach(async () => {
    broker1 = createNode({
      nodeId: 'node1_' + Date.now(),
      transport: {
        adapter: 'dummy'
      }
    });

    broker2 = createNode({
      nodeId: 'node2_' + Date.now(),
      transport: {
        adapter: 'dummy'
      }
    });

    broker1.createService({
      name: 'testService1',
      events: {
        testEvent1: testEventS1
      }
    });

    broker2.createService({
      name: 'testService2',
      events: {
        testEvent2: testEventS2
      }
    });

    await Promise.all([broker1.start(), broker2.start()]);
  });

  afterEach(async () => {
    await Promise.all([broker1.stop(), broker2.stop()]);
  });

  it('should call remote events', () => {
    broker1.emit('testEvent1');
    expect(testEventS1).toHaveBeenCalledTimes(1);
  });

  it('should call remote events with data', () => {
    broker1.emit('testEvent1', { userId: 123 });
    expect(testEventS1).toHaveBeenCalledTimes(2);
  });
});

describe('Event context', () => {
  const fakeEvent = jest.fn(context => context);

  const node1 = createNode({
    nodeId: 'test-event-context1',
    transport: {
      adapter: 'dummy'
    }
  });

  const node2 = createNode({
    nodeId: 'test-event-context2',
    transport: {
      adapter: 'dummy'
    }
  });
  5;
  node2.createService({
    name: 'test',
    events: {
      'test.event': fakeEvent
    }
  });

  beforeAll(() => Promise.all([node1, node2].map(node => node.start())));
  afterAll(() => Promise.all([node1, node2].map(node => node.stop())));

  it('should call an action from an event', () => {
    node1.emit('test.event', { name: 'hallo' });
    const result = fakeEvent.mock.results[0];
    expect(fakeEvent).toHaveBeenCalledTimes(1);
    expect(isContext(result)).toBe(true);
  });
});

describe('Event parameter validation', () => {
  const fakeEvent = jest.fn(context => context);

  const node1 = createNode({
    nodeId: 'test-event-validation',
    transport: {
      adapter: 'dummy'
    }
  });

  const node2 = createNode({
    nodeId: 'test-event-validation2',
    transport: {
      adapter: 'dummy'
    }
  });

  node2.createService({
    name: 'test',
    events: {
      'test.event': {
        params: {
          name: 'string'
        },
        handler: fakeEvent
      }
    }
  });

  beforeAll(() => Promise.all([node1, node2].map(node => node.start())));
  afterAll(() => Promise.all([node1, node2].map(node => node.stop())));

  it('should call an action from an event', () => {
    node1.emit('test.event', { name: 'hallo' });
    const result = fakeEvent.mock.results[0];
    expect(fakeEvent).toHaveBeenCalledTimes(1);
    expect(isContext(result)).toBe(true);
  });
});

describe('Local service events', () => {
  const node1 = createNode({
    nodeId: 'test-event-validation'
  });

  beforeAll(() => Promise.all([node1].map(node => node.start())));
  afterAll(() => Promise.all([node1].map(node => node.stop())));

  it('should emit local events', (done) => {
    const fakeEvent = jest.fn(context => context);

    node1.createService({
      name: 'test',
      events: {
        'test.event': {
          params: {
            name: 'string'
          },
          handler: fakeEvent
        }
      },
      started () {
        this.events['test.event']({ name: 'Mike' });
        expect(fakeEvent).toHaveBeenCalledTimes(1);
        done();
      }
    });
  });
});

describe('Event acknowledgement', () => {
  const node1 = createNode({
    nodeId: 'test-event-validation'
  });

  beforeAll(() => Promise.all([node1].map(node => node.start())));
  afterAll(() => Promise.all([node1].map(node => node.stop())));

  it('', () => {
    node1.emit('user-created', null, { ack: true });
  });
});

describe('Event error handling', () => {
  const nodes = createNodes(['test-event-error-handling']);

  beforeAll(() => Promise.all(nodes.map(node => node.start())));
  afterAll(() => Promise.all(nodes.map(node => node.stop())));

  it('should throw an error', async () => {
    const node = nodes[0];
    try {
      await node.emit('failed-event');
    } catch (error) {
      expect(error.message).toBe('This is a failed event');
    }
  });
});
