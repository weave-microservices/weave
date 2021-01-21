// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'errors'.
const errors = require('../new-errors');
exports.restoreError = (error) => {
    const ErrorClass = errors[error.name];
    if (ErrorClass) {
        switch (error.name) {
            case 'WeaveError':
                return new ErrorClass(error.message, error.code, error.type, error.data);
        }
    }
};
