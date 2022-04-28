const errors = require('../');

exports.restoreError = (error: any): Error | null => {
  const ErrorClass = errors[error.name];

  if (ErrorClass) {
    switch (error.name) {
    case 'WeaveError':
      return new ErrorClass(error.message, error.code, error.type, error.data);
    }
  }

  return null
};
