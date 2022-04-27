import { PingPayload } from "./PingPayload";

  /**
   * Ping handler
   * @param {any} payload - Payload
   * @returns {Promise} Promise
  */
const createPingHandler = (
  transport: any 
): any => (payload: PingPayload) => {
    const pingMessage = createMessage(MessageTypes.MESSAGE_PONG, payload.sender, {
      dispatchTime: payload.dispatchTime,
      arrivalTime: Date.now()
    });

    transport.send(pingMessage);
  };

export { createPingHandler };
