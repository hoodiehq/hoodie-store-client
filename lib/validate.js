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

    if (rejectValue instanceof Error) {
      Object.keys(rejectValue).map(function (key) {
        error[key] = rejectValue[key]
      })

      if (rejectValue.message) {
        error.message = rejectValue.message
      } else {
        error.message = 'document validation failed'
      }
    } else {
      if (typeof rejectValue === 'string') {
        error.message = rejectValue
      } else {
        error.message = 'check error value for more details'
        error.value = rejectValue
      }
    }

    error.name = 'ValidationError'
    throw error
  })
}
