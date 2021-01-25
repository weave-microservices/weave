import { Broker } from '../shared/interfaces/broker.interface';
import { MiddlewareHandler } from '../shared/interfaces/middleware-handler.interface';
import { TransportAdapter } from '../shared/interfaces/transport-adapter.interface';
import { Transport } from '../shared/interfaces/transport.interface';
/**
 * Create a Transport adapter
 * @param {BrokerInstance} broker Borker instance
 * @param {Object} adapter Adapter wrapper
 * @returns {Transport} transport
 */
export declare function createTransport(broker: Broker, adapter: TransportAdapter, middlewareHandler: MiddlewareHandler): Transport;
