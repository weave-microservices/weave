/* istanbul ignore next */

import { BrokerConfiguration } from "../broker/BrokerConfiguration";

/**
 * Create and register a new service
 * @param {BrokerConfiguration} configuration - Broker options
 * @returns {BrokerConfiguration} Broker options
*/
export default function (configuration: BrokerConfiguration): BrokerConfiguration {
  return configuration;
};
