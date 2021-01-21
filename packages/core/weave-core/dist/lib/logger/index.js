"use strict";
/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2019 Fachwerk
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDefaultLogger = exports.LogLevel = void 0;
const path_1 = __importDefault(require("path"));
const util_1 = __importDefault(require("util"));
const kleur_1 = __importDefault(require("kleur"));
const figures_1 = __importDefault(require("figures"));
const kleur_2 = require("kleur");
const types_1 = require("./types");
// log levels
var LogLevel;
(function (LogLevel) {
    LogLevel["Trace"] = "trace";
    LogLevel["Debug"] = "debug";
    LogLevel["Info"] = "info";
    LogLevel["Warn"] = "warn";
    LogLevel["Error"] = "error";
    LogLevel["Fatal"] = "fatal";
})(LogLevel = exports.LogLevel || (exports.LogLevel = {}));
const LOG_LEVELS = [
    'trace',
    'debug',
    'info',
    'warn',
    'error',
    'fatal'
];
const dummyLogMethod = () => { };
const mergeTypes = function (standard, custom) {
    const types = Object.assign({}, standard);
    Object.keys(custom).forEach(type => {
        types[type] = Object.assign({}, types[type], custom[type]);
    });
    return types;
};
const getLongestBadge = (options) => {
    const labels = Object.keys(options.types).map(x => options.types[x].badge);
    return labels.reduce((x, y) => x.length > y.length ? x : y);
};
const getLongestLabel = (options) => {
    const labels = Object.keys(options.types).map(x => options.types[x].label);
    return labels.reduce((x, y) => x.length > y.length ? x : y);
};
const getDate = () => {
    const date = new Date();
    return date.toISOString();
};
function createDefaultLogger(options, bindings) {
    const logMethods = {};
    const customTypes = Object.assign({}, options.types);
    const types = mergeTypes(types_1.defaultTypes, customTypes);
    // process log types
    Object.keys(types).forEach(type => {
        const isActive = options.enabled && (LOG_LEVELS.indexOf(types[type].logLevel) >= LOG_LEVELS.indexOf(options.logLevel));
        logMethods[type] = isActive ? logger.bind(this, type) : dummyLogMethod;
    });
    const longestBadge = getLongestBadge(options);
    const longestLabel = getLongestLabel(options);
    const getModuleName = () => {
        let module;
        if (bindings.service) {
            module = bindings.service.name;
        }
        else if (bindings.moduleName) {
            module = bindings.moduleName;
        }
        return `${bindings.nodeId}/${module}`;
    };
    const getFilename = () => {
        const tempStackTrace = Error.prepareStackTrace;
        Error.prepareStackTrace = (_, stack) => stack;
        const { stack } = new Error();
        Error.prepareStackTrace = tempStackTrace;
        const callers = stack.map(x => x.getFileName());
        const firstExternalFilePath = callers.find(x => x !== callers[0]);
        return firstExternalFilePath ? path_1.default.basename(firstExternalFilePath) : 'anonymous';
    };
    const formatDate = () => `[${getDate()}]`;
    const formatFilename = () => kleur_2.gray(`[${getFilename()}]`);
    const arrayify = i => Array.isArray(i) ? i : [i];
    const formatStream = stream => arrayify(stream);
    const buildMeta = (rawMessages) => {
        const meta = [];
        if (options.displayTimestamp) {
            const timestamp = formatDate();
            rawMessages.timestamp = timestamp;
            meta.push(timestamp);
        }
        if (meta.length !== 0) {
            meta.push(`${figures_1.default.pointerSmall}`);
            return meta.map(item => kleur_2.gray(item));
        }
        return meta;
    };
    const formatMessage = args => util_1.default.formatWithOptions({ colors: true, compact: 1, breakLength: Infinity }, ...arrayify(args));
    const formatAdditional = ({ prefix, suffix }, args) => {
        return (suffix || prefix) ? '' : formatMessage(args);
    };
    const write = (stream, message) => {
        stream.write(message + '\n');
    };
    const buildMessage = (type, ...args) => {
        let [msg, additional] = [{}, {}];
        if (args.length === 1 && typeof args[0] === 'object' && args[0] !== null) {
            if (args[0] instanceof Error) {
                [msg] = args;
            }
            else {
                const [{ prefix, message, suffix }] = args;
                additional = Object.assign({}, { prefix, suffix });
                msg = message ? formatMessage(message) : formatAdditional(additional, args);
            }
        }
        else {
            msg = formatMessage(args);
        }
        const rawMessages = {};
        const messages = buildMeta(rawMessages);
        if (additional.prefix) {
            rawMessages.prefix = additional.prefix;
            messages.push(additional.prefix);
        }
        if (options.displayBadge && type.badge) {
            rawMessages.badge = type.badge;
            messages.push(kleur_1.default[type.color](type.badge.padEnd(longestBadge.length + 1)));
        }
        if (msg instanceof Error && msg.stack) {
            const [name, ...rest] = msg.stack.split('\n');
            messages.push(name);
            messages.push(kleur_2.dim(kleur_2.grey(rest.map(l => l.replace(/^/, '\n')).join(''))));
            return messages.join(' ');
        }
        if (options.displayLabel && type.label) {
            rawMessages.label = type.label;
            messages.push(kleur_1.default[type.color](kleur_2.underline(type.label).padEnd(kleur_2.underline(longestLabel).length + 1)));
        }
        if (options.displayModuleName) {
            const moduleName = getModuleName();
            rawMessages.moduleName = moduleName;
            messages.push(kleur_2.gray(`[${moduleName}]`));
        }
        messages.push(msg);
        if (options.displayFilename) {
            messages.push(formatFilename());
        }
        if (type.done) {
            type.done.call(null, msg, rawMessages);
        }
        return messages.join(' ');
    };
    const log = (message, streams = options.stream, logLevel) => {
        formatStream(streams).forEach(stream => write(stream, message));
    };
    function logger(type, ...messageObject) {
        const { stream, logLevel } = types[type];
        const message = buildMessage(options.types[type], ...messageObject);
        return log(message, stream, logLevel);
    }
    return logMethods;
}
exports.createDefaultLogger = createDefaultLogger;
;
