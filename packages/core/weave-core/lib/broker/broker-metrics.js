"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerMetrics = void 0;
const Constants = __importStar(require("../metrics"));
function registerMetrics(broker) {
    if (broker.metrics) {
        broker.metrics.register({ name: Constants.WEAVE_ENVIRONMENT, type: 'info', description: 'Node environment.' }).set('nodejs');
        broker.metrics.register({ name: Constants.WEAVE_VERSION, type: 'info', description: 'Weave version.' }).set(broker.version);
        broker.metrics.register({ name: Constants.WEAVE_NODE_ID, type: 'info', description: 'Node ID.' }).set(broker.nodeId);
        broker.metrics.register({ name: Constants.WEAVE_NAMESPACE, type: 'info', description: 'Namespace in which the node runs.' }).set(broker.namespace);
    }
}
exports.registerMetrics = registerMetrics;
//# sourceMappingURL=broker-metrics.js.map