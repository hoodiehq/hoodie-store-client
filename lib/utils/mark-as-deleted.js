var assign = require('lodash/assign')
var changeObject = require('./change-object')

// Normalizes objectOrId, tries to apply changes if any, and mark as deleted
module.exports = function markAsDeleted (state, change, objectOrId) {
  var object = typeof objectOrId === 'string' ? { _id: objectOrId } : objectOrId

  if (change) {
    return changeObject(state, change, object)

    .then(function (doc) {
      return assign({_deleted: true}, doc)
    })
  }

  return Promise.resolve(assign({_deleted: true}, object))
}
