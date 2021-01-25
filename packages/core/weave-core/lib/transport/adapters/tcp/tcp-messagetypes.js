"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTCPMessageTypeHelper = void 0;
function createTCPMessageTypeHelper(messagetypes) {
    const messageTypeIndexes = {};
    Object
        .keys(messagetypes)
        .forEach((messageType, index) => {
        messageTypeIndexes[messagetypes[messageType]] = index;
    });
    return {
        getIndexByType(messageType) {
            return messageTypeIndexes[messageType];
        },
        getTypeByIndex(index) {
            return Object.keys(messageTypeIndexes).find(key => messageTypeIndexes[key] === index);
        }
    };
}
exports.createTCPMessageTypeHelper = createTCPMessageTypeHelper;
//# sourceMappingURL=tcp-messagetypes.js.map