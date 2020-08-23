const errors = require('../new-errors')

module.exports = error => {
  const ErrorClass = errors[error.name]

  if (ErrorClass) {
    switch (error.name) {
    case 'WeaveError':
      return new ErrorClass(error.message, error.code, error.type, error.data)
    }
  }
}
