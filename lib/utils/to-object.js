var assign = require('lodash/assign')

module.exports = function docToObject (doc) {
  if (doc instanceof Error) {
    return doc
  }

  var object = assign({}, doc, {
    id: doc._id
  })

  delete object._id
  return object
}
