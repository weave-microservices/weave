
/* istanbul ignore next */

import { ServiceSchema } from "../service/ServiceSchema";

/**
 * Create and register a new service
 * @param {ServiceSchema} serviceSchema - Schema of the Service
 * @returns {ServiceSchema} Service schema
*/
export default function (serviceSchema: ServiceSchema): ServiceSchema {
  return serviceSchema;
};
