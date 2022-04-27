import { ActionContext } from "../broker/ActionContext";
import { Runtime } from "../runtime/Runtime";
import { RequestPayload } from "./RequestPayload";
import { Transport } from "./Transport";



const createRequestHandler = ({ runtime, transport }: {
  runtime: Runtime,
  transport: Transport
}) => {
  const getRequestTimeout = (payload: RequestPayload) => {
    return payload.timeout || runtime.options.registry.requestTimeout || 0;
  };

  const handleIncomingRequestStream = function (payload: RequestPayload) {
    // check for open stream.
    let stream = transport.pending.requestStreams.get(payload.id);
    let isNew: boolean = false;
  
    if (!payload.isStream && !stream) {
      return false;
    }
  
    if (!stream) {
      isNew = true;
      stream = new InboundTransformStream(
        payload.sender,
        payload.id, {
          objectMode: payload.meta && payload.meta.$isObjectModeStream
        }
      );
  
      // handle backpressure
      if (runtime.options.transport.streams.handleBackpressure) {
        stream.on('backpressure', async ({ sender, requestId }) => {
          const message = createMessage(MessageTypes.MESSAGE_REQUEST_STREAM_BACKPRESSURE, sender, { id: requestId });
          await transport.send(message);
        });
  
        stream.on('resume_backpressure', async ({ sender, requestId }) => {
          const message = createMessage(MessageTypes.MESSAGE_REQUEST_STREAM_RESUME, sender, { id: requestId });
          await transport.send(message);
        });
      }
  
      stream.$prevSeq = -1;
      stream.$pool = new Map();
  
      transport.pending.requestStreams.set(payload.id, stream);
    }
  
    if (payload.sequence > (stream.$prevSeq + 1)) {
      stream.$pool.set(payload.sequence, payload);
      return isNew ? stream : null;
    }
  
    stream.$prevSeq = payload.sequence;
  
    if (stream.$prevSeq > 0) {
      if (!payload.isStream) {
        transport.log.debug('Stream ended', payload.sender);
  
        // Todo: Handle errors
  
        // end of stream
        stream.end();
        transport.pending.requestStreams.delete(payload.id);
        return null;
      } else {
        transport.log.debug('Stream chunk received from ', payload.sender);
        stream.write(payload.chunk.type === 'Buffer' ? Buffer.from(payload.chunk.data) : payload.chunk);
      }
    }
  
    if (stream.$pool.size > 0) {
      transport.log.debug(`Stream has stored packages. Size: ${stream.$pool.size}`, payload.sender);
      const nextSequence = stream.$prevSeq + 1;
      const nextChunk = stream.$pool.get(nextSequence);
      if (nextChunk) {
        stream.$pool.delete(nextSequence);
        setImmediate(() => handleRequest(nextChunk));
      }
    }
  
    return isNew ? stream : null;
  };

  function handleRequest (payload: RequestPayload) {
    const { registry } = runtime
    const sender = payload.sender;

    try {
      let stream;
  
      // Handle incomming stream
      if (payload.isStream !== undefined) {
        // check for open stream.
        stream = handleIncomingRequestStream(payload);
        if (!stream) {
          return Promise.resolve();
        }
      }
  
      const endpoint = registry.getLocalActionEndpoint(payload.action);
      const context = new ActionContext(runtime);
  
      context.setEndpoint(endpoint);
      context.id = payload.id;
      context.setData(payload.data);
      context.parentId = payload.parentId;
      context.requestId = payload.requestId;
      context.meta = payload.meta || {};
      context.metrics = payload.metrics;
      context.level = payload.level;
      context.callerNodeId = payload.sender;
      context.options.timeout = getRequestTimeout(payload);
  
      // If payload is a stream, attach stream to context
      if (payload.isStream) {
        context.stream = stream;
      }
  

      const actionName = context.action.name;

      // // Get available endpoints
      // const endpointList = registry.getActionEndpoints(actionName);
    
      // // Reject the request if no local endpoint can be found.
      // if (endpointList == null || !endpointList.hasLocal()) {
      //   transport.log.warn(`Service ${actionName} not found localy.`);
      //   return Promise.reject('Service not found');
      // }
    
      // From all available local endpoints - get one.
      // const endpoint = endpointList.getNextLocalEndpoint();
    
      // if there is no endpoint, reject
      if (!endpoint) {
        transport.log.warn(`Service ${actionName} is not available localy.`);
        return Promise.reject('Service not found');
      }
    
      // Call the local action handler with context
      const promise = endpoint.action.handler(context);
      promise.context = context;

      return promise
        .then((data: unknown) => transport.sendResponse(sender, payload.id, data, context.meta, null))
        .catch((error: Error) => transport.sendResponse(sender, payload.id, null, context.meta, error));
    } catch (error) {
      return transport.sendResponse(sender, payload.id, null, payload.meta, error);
    }
  };

  return handleRequest
}


export { createRequestHandler };

const localRequestProxy = (context: ActionContext) => {
  const actionName = context.action.name;

  // Get available endpoints
  const endpointList = registry.getActionEndpoints(actionName);

  // Reject the request if no local endpoint can be found.
  if (endpointList == null || !endpointList.hasLocal()) {
    transport.log.warn(`Service ${actionName} not found localy.`);
    return Promise.reject('Service not found');
  }

  // From all available local endpoints - get one.
  const endpoint = endpointList.getNextLocalEndpoint();

  // if there is no endpoint, reject
  if (!endpoint) {
    transport.log.warn(`Service ${actionName} is not available localy.`);
    return Promise.reject('Service not found');
  }

  // Call the local action handler with context
  const promise = endpoint.action.handler(context);
  promise.context = context;

  return promise;
};