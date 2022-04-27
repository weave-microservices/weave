import { EventContext } from "../broker/EventContext";
import { Runtime } from "../runtime/Runtime";
import { EventPayload } from "./EventPayload";
import { Transport } from "./Transport";

const createEventHandler = ({ runtime, transport }: {
  runtime: Runtime,
  transport: Transport
}) => (payload: EventPayload) => {
  const { registry } = runtime
  transport.log.debug(`Received event "${payload.eventName}"`);

  if (!runtime.state.isStarted) {
    return;
  }

  // todo: reconstruct event context
  const context = new EventContext(runtime);

  // context.setEndpoint(endpoint)
  context.id = payload.id;
  context.setData(payload.data);
  context.parentId = payload.parentId;
  context.requestId = payload.requestId;
  context.meta = payload.meta || {};
  context.metrics = payload.metrics;
  context.level = payload.level;
  context.callerNodeId = payload.sender;

  if (payload.timeout) {
    context.options.timeout = payload.timeout;
  }

  // add event infos
  context.eventName = payload.eventName;
  context.eventType = payload.isBroadcast ? 'broadcast' : 'emit';

  return registry.eventCollection.emitLocal(context);
};

export { createEventHandler };