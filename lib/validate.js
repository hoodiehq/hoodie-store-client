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
  .catch(function (rejectValue) {
    var error = new Error()

    if (!(rejectValue instanceof Error)) {
      if (typeof rejectValue === 'string') {
        error.message = rejectValue
      } else {
        error.message = 'check error value for more details'
        error.value = rejectValue
      }
    } else {
      if (!rejectValue.message) {
        error.message = 'your doc(s) failed validation'
      } else {
        error.message = rejectValue.message
      }
    }

    error.name = 'ValidationError'
    throw error
  })
}
