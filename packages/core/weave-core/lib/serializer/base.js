"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBaseSerializer = void 0;
function createBaseSerializer(options) {
    return {
        init() {
        },
        serialize(obj) {
            throw new Error('Serializer not implemented.');
        },
        deserialize(obj) {
            throw new Error('Deserialize not implemented.');
        }
    };
}
exports.createBaseSerializer = createBaseSerializer;
//# sourceMappingURL=base.js.map