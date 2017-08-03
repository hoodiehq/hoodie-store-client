module.exports = validate

var Promise = require('lie')

function validate (state, doc) {
  var self = this
  return new Promise(function (resolve, reject) {
    var result

    try {
      result = state.validate.call(self, doc)
    } catch (error) {
      reject(error)
    }

    if (result && result.then) {
      return result.then(resolve, reject)
    }

    if (!result) {
      var error = new Error('Document is not valid')

      error.name = 'ValidationError'
      reject(error)
    }

    resolve(doc)
  })
}
