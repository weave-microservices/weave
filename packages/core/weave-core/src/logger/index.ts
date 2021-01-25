/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2019 Fachwerk
 */

import path from 'path';
import util from 'util';
import { Stream } from 'stream'
import kleur from 'kleur';
import figures from 'figures';
import { gray, underline, grey, dim } from 'kleur';
import { defaultTypes } from './types';
import { LogType } from '../shared/types/log-type.type';
import { LoggerOptions } from '../shared/types/logger-options.type';
import { Logger } from '../shared/interfaces/logger.interface';
import { LogLevel } from '../shared/enums/log-level.enum';

const LOG_LEVELS = [
    'trace',
    'debug',
    'info',
    'warn',
    'error',
    'fatal'
];

const dummyLogMethod = () => {};

const mergeTypes = function (standard, custom): { [key: string]: LogType } {
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

export function createDefaultLogger (options: LoggerOptions, bindings): Logger {
    const logMethods = {};
    const customTypes = Object.assign({}, options.types);
    options.types = mergeTypes(defaultTypes, customTypes);

    // process log types
    Object.keys(options.types).forEach(type => {
        const isActive = options.enabled && (LOG_LEVELS.indexOf(options.types[type].logLevel) >= LOG_LEVELS.indexOf(options.logLevel));
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
        const callers = (stack as any).map(x => x.getFileName());
        const firstExternalFilePath = callers.find(x => x !== callers[0]);
        return firstExternalFilePath ? path.basename(firstExternalFilePath) : 'anonymous';
    };

    const formatDate = () => `[${getDate()}]`;
    const formatFilename = () => gray(`[${getFilename()}]`);
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
            meta.push(`${figures.pointerSmall}`);
            return meta.map(item => gray(item));
        }
        return meta;
    };


    const formatMessage = args => {
        args = arrayify(args)
        return util.formatWithOptions({ colors: true, compact: 1, breakLength: Infinity }, args[0], ...args.splice(0, 1));   
    }

    const formatAdditional = ({ prefix, suffix }: any, args) => {
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
        if ((additional as any).prefix) {
            (rawMessages as any).prefix = (additional as any).prefix;
            messages.push((additional as any).prefix);
        }
        if (options.displayBadge && type.badge) {
            (rawMessages as any).badge = type.badge;
            messages.push(kleur[type.color](type.badge.padEnd(longestBadge.length + 1)));
        }
        if (msg instanceof Error && msg.stack) {
            const [name, ...rest] = msg.stack.split('\n');
            messages.push(name);
            messages.push(dim(grey(rest.map(l => l.replace(/^/, '\n')).join(''))));
            return messages.join(' ');
        }
        if (options.displayLabel && type.label) {
            (rawMessages as any).label = type.label;
            messages.push(kleur[type.color](underline(type.label).padEnd(underline(longestLabel).length + 1)));
        }
        if (options.displayModuleName) {
            const moduleName = getModuleName();
            (rawMessages as any).moduleName = moduleName;
            messages.push(gray(`[${moduleName}]`));
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
    
    const log = (message, streams = options.stream, logLevel: LogLevel) => {
        formatStream(streams).forEach(stream => write(stream, message));
    };

    function logger(type, ...messageObject) {
        const { stream, logLevel } = options.types[type];
        const message = buildMessage(options.types[type], ...messageObject);
        return log(message, stream, logLevel);
    }

    return logMethods;
};
