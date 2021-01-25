import { Registry } from '../../shared/interfaces/registry.interface';
/**
 * Configuration object for weave service broker.
 * @typedef {Object} ActionCollection
 * @property {Function} add Enable metric middleware. (default = false)
 * @property {Array<String|Object>} adapters Array of metric adapters.
*/
/**
 * Create an action collection.
 * @param {any} registry Reference to the registry.
 * @returns {ActionCollection} Action collection
*/
export declare function createActionCollection(registry: Registry): any;
