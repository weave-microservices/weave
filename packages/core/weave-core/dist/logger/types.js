"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultTypes = exports.createLogLevel = void 0;
const figures_1 = __importDefault(require("figures"));
const log_types_1 = require("./log-types");
function createLogLevel(badge, color, label, logLevel) {
    return {
        badge,
        color,
        label,
        logLevel
    };
}
exports.createLogLevel = createLogLevel;
exports.defaultTypes = {
    log: createLogLevel('', '', '', log_types_1.LogLevel.Info),
    info: createLogLevel(figures_1.default.info, 'blue', 'info', log_types_1.LogLevel.Info),
    success: createLogLevel(figures_1.default.tick, 'green', 'success', log_types_1.LogLevel.Info),
    progress: createLogLevel(figures_1.default.pointer, 'yellow', 'progress', log_types_1.LogLevel.Info),
    debug: createLogLevel(figures_1.default('⬤'), 'red', 'debug', log_types_1.LogLevel.Debug),
    trace: createLogLevel(figures_1.default('⬤'), 'gray', 'trace', log_types_1.LogLevel.Trace),
    error: createLogLevel(figures_1.default.cross, 'red', 'error', log_types_1.LogLevel.Error),
    fatal: createLogLevel('!!', 'red', 'fatal', log_types_1.LogLevel.Fatal),
    warn: createLogLevel(figures_1.default.warning, 'yellow', 'warning', log_types_1.LogLevel.Warn),
    wait: createLogLevel(figures_1.default.ellipsis, 'blue', 'waiting', log_types_1.LogLevel.Info),
    completed: createLogLevel(figures_1.default.checkboxOn, 'cyan', 'completed', log_types_1.LogLevel.Info),
    note: createLogLevel(figures_1.default.bullet, 'blue', 'note', log_types_1.LogLevel.Info),
    star: createLogLevel(figures_1.default.star, 'yellow', 'star', log_types_1.LogLevel.Info),
    fav: createLogLevel(figures_1.default('❤'), 'magenta', 'favorite', log_types_1.LogLevel.Info)
};
