"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSerializerFactory = void 0;
const JSONSerializer = require('./json');
function createSerializerFactory({ getLogger, options }) {
    const serializer = options.serializer || JSONSerializer;
    serializer.init({ getLogger });
    return serializer;
}
exports.createSerializerFactory = createSerializerFactory;
