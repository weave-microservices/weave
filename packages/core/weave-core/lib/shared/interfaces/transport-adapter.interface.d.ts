/// <reference types="node" />
import { Broker } from "./broker.interface";
import { Logger } from "./logger.interface";
import { EventEmitter2 as EventEmitter } from 'eventemitter2';
import { TransportAdapterConnectionFeatures } from "../types/transport-adapter-connection-features.type";
import { ErrorHandlerDelegate } from "../types/error-handler-delegate.type";
import { TransportMessage } from "../types/transport-message.type";
import { MessageHandlerResult } from "../types/message-handler-result.type";
import { Transport } from "./transport.interface";
export interface TransportAdapter {
    name: string;
    broker: Broker;
    transport: Transport;
    messageHandler: MessageHandlerResult;
    log: Logger;
    bus: EventEmitter;
    afterInit: Function;
    isConnected: boolean;
    interruptCounter: number;
    repeatAttemptCounter: number;
    init(broker: Broker, transport: Transport, messageHandler: MessageHandlerResult): any;
    connect(isReconnected: boolean, handleError: ErrorHandlerDelegate): Promise<void>;
    subscribe(type: string, nodeId?: string): Promise<any>;
    connected(features: TransportAdapterConnectionFeatures): void;
    disconnected(): void;
    close(): Promise<any>;
    getTopic(cmd: string, nodeId: string): string;
    preSend(message: TransportMessage): Promise<any>;
    send(message: TransportMessage): Promise<any>;
    incommingMessage(messageType: string, buffer: Buffer): void;
    serialize(message: TransportMessage): Buffer;
    deserialize(packet: string): any;
    updateStatisticSent(length: number): void;
    updateStatisticReceived(length: number): void;
}
