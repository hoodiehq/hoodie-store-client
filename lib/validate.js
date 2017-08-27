module.exports = validate

var Promise = require('lie')

function validate (state, doc) {
  if (state.validate === undefined) {
    return Promise.resolve()
  }

  return Promise.resolve()

  .then(function () {
    return state.validate(doc)
  })
  .catch(function (error) {
    var err = new Error()

    if (!(error instanceof Error)) {
      if (typeof error === 'string') {
        err.message = error
      } else {
        err.message = 'check error value for more details'
        err.value = error
      }
    } else {
      if (!error.message) {
        err.message = 'your doc(s) failed validation'
      } else {
        err.message = error.message
      }
    }

    err.name = 'ValidationError'
    throw err
  })
}
