import * as Constants from '../metrics';
import { Broker } from '../shared/interfaces/broker.interface';

export function registerMetrics(broker: Broker): void {
  if (broker.metrics) {
    broker.metrics.register({ name: Constants.WEAVE_ENVIRONMENT, type: 'info', description: 'Node environment.' }).set('nodejs')
    broker.metrics.register({ name: Constants.WEAVE_VERSION, type: 'info', description: 'Weave version.' }).set(broker.version)
    broker.metrics.register({ name: Constants.WEAVE_NODE_ID, type: 'info', description: 'Node ID.' }).set(broker.nodeId)
    broker.metrics.register({ name: Constants.WEAVE_NAMESPACE, type: 'info', description: 'Namespace in which the node runs.' }).set(broker.namespace)
  }
}
