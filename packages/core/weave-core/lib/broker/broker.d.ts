import { Broker } from '../shared/interfaces/broker.interface';
import { BrokerOptions } from '../shared/interfaces/broker-options.interface';
/**
 * Creates a new Weave instance
 * @export
 * @param {BrokerOptions} options BrokerOptions
 * @returns {Broker}
 */
export declare function createBroker(options: BrokerOptions): Broker;
