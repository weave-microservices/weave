"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultTypes = exports.createLogLevel = void 0;
const figures_1 = __importDefault(require("figures"));
const index_1 = require("./index");
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
    log: createLogLevel('', '', '', index_1.LogLevel.Info),
    info: createLogLevel(figures_1.default.info, 'blue', 'info', index_1.LogLevel.Info),
    success: createLogLevel(figures_1.default.tick, 'green', 'success', index_1.LogLevel.Info),
    progress: createLogLevel(figures_1.default.pointer, 'yellow', 'progress', index_1.LogLevel.Info),
    debug: createLogLevel(figures_1.default('⬤'), 'red', 'debug', index_1.LogLevel.Debug),
    trace: createLogLevel(figures_1.default('⬤'), 'gray', 'trace', index_1.LogLevel.Trace),
    error: createLogLevel(figures_1.default.cross, 'red', 'error', index_1.LogLevel.Error),
    fatal: createLogLevel('!!', 'red', 'fatal', index_1.LogLevel.Fatal),
    warn: createLogLevel(figures_1.default.warning, 'yellow', 'warning', index_1.LogLevel.Warn),
    wait: createLogLevel(figures_1.default.ellipsis, 'blue', 'waiting', index_1.LogLevel.Info),
    completed: createLogLevel(figures_1.default.checkboxOn, 'cyan', 'completed', index_1.LogLevel.Info),
    note: createLogLevel(figures_1.default.bullet, 'blue', 'note', index_1.LogLevel.Info),
    star: createLogLevel(figures_1.default.star, 'yellow', 'star', index_1.LogLevel.Info),
    fav: createLogLevel(figures_1.default('❤'), 'magenta', 'favorite', index_1.LogLevel.Info)
};
