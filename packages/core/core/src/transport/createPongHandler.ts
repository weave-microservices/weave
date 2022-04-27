import { Runtime } from "../runtime/Runtime";
import { PongPayload } from "./PongPayload";

const createPongHandler = ({ runtime }: {
  runtime: Runtime
}) => (payload: PongPayload) => {
  const now = Date.now();
  const elapsedTime = now - payload.dispatchTime;
  const timeDiff = Math.round(now - payload.arrivalTime - elapsedTime / 2);

  runtime.eventBus.broadcastLocal('$node.pong', {
    nodeId: payload.sender,
    elapsedTime,
    timeDiff
  });
};

export { createPongHandler }