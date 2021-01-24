"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeJsonSerializer = void 0;
const base_1 = require("./base");
function makeJsonSerializer(options) {
    const self = base_1.createBaseSerializer(options);
    return Object.assign(self, {
        serialize(obj) {
            return Buffer.from(JSON.stringify(obj));
        },
        deserialize(buffer) {
            return JSON.parse(buffer);
        }
    });
}
exports.makeJsonSerializer = makeJsonSerializer;
