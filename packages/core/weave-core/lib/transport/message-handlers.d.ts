import { MessageHandlerResult } from "../shared/types/message-handler-result.type";
import { PendingStore } from '../shared/types/pending-store.type';
import { Broker } from '../shared/interfaces/broker.interface';
import { Transport } from '../shared/interfaces/transport.interface';
export declare function createMessageHandler(broker: Broker, transport: Transport, pending: PendingStore): MessageHandlerResult;
