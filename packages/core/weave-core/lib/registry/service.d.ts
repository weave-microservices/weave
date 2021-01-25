import { Broker } from '../shared/interfaces/broker.interface';
import { Service } from '../shared/interfaces/service.interface';
import { MiddlewareHandler } from '../shared/interfaces/middleware-handler.interface';
/**
 * Create and register a new service
 * @param {Broker} broker Broker instance
 * @param {Object} middlewareHandler Middleware handler
 * @param {Function} addLocalService Add Service to the local service map
 * @param {Function} registerLocalService Register service.
 * @param {ServiceSchema} schema Service schema
 * @returns {Object} Service instance
 */
export declare function createServiceFromSchema(broker: Broker, middlewareHandler: MiddlewareHandler, addLocalService: any, registerLocalService: any, schema: any): Service;
