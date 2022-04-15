const messageTypes = require('../../../src/transport/messageTypes');

describe('Message types', () => {
  it('should return defined message types', () => {
    expect(messageTypes.MESSAGE_DISCONNECT).toBeDefined();
    expect(messageTypes.MESSAGE_DISCOVERY).toBeDefined();
    expect(messageTypes.MESSAGE_EVENT).toBeDefined();
    expect(messageTypes.MESSAGE_HEARTBEAT).toBeDefined();
    expect(messageTypes.MESSAGE_INFO).toBeDefined();
    expect(messageTypes.MESSAGE_PONG).toBeDefined();
    expect(messageTypes.MESSAGE_REQUEST).toBeDefined();
    expect(messageTypes.MESSAGE_RESPONSE).toBeDefined();
    expect(messageTypes.MESSAGE_RESPONSE_STREAM_BACKPRESSURE).toBeDefined();
    expect(messageTypes.MESSAGE_RESPONSE_STREAM_RESUME).toBeDefined();
    expect(messageTypes.MESSAGE_UNKNOWN).toBeDefined();
  });
});
