"use strict";
/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2020 Fachwerk
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createValidator = void 0;
const ObjectValidator = require('@weave-js/validator');
const { WeaveParameterValidationError } = require('../errors');
function createValidator() {
    const validator = ObjectValidator();
    // attach the middleware to object validator
    validator.middleware = {
        localAction(handler, action) {
            if (action.params && typeof action.params === 'object') {
                const validate = validator.compile(action.params);
                return context => {
                    let result = validate(context.data);
                    if (result === true) {
                        return handler(context);
                    }
                    else {
                        result = result.map(data => Object.assign(data, { nodeId: context.nodeId, action: context.action.name }));
                        return Promise.reject(new WeaveParameterValidationError('Parameter validation error', result));
                    }
                };
            }
            return handler;
        }
    };
    return validator;
}
exports.createValidator = createValidator;
//# sourceMappingURL=validator.js.map