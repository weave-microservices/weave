exports.assign    = Object.assign
exports.passError = passError;
exports.passValue = passValue;

// -----------------------------------------------------------------------------

function passError(callback) {
    return function (reason) {
        setImmediate(function () {
            callback(reason);
        });
    };
}

function passValue(callback) {
    return function (value) {
        setImmediate(function () {
            callback(null, value);
        });
    };
}