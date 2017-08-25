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
    error.name = 'ValidationError'
    throw error
  })
}
