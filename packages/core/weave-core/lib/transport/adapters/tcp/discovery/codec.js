"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCodec = void 0;
function createCodec() {
    return {
        encode(object) {
            return Buffer.from(JSON.stringify(object));
        },
        decode(buffer) {
            return JSON.parse(buffer.toString());
        }
    };
}
exports.createCodec = createCodec;
//# sourceMappingURL=codec.js.map