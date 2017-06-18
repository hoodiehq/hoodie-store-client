var assign = require('lodash/assign')
var changeObject = require('./change-object')

// Normalizes objectOrId, applies changes if any, and mark as deleted
module.exports = function markAsDeleted (change, objectOrId) {
  var object = typeof objectOrId === 'string' ? { _id: objectOrId } : objectOrId

  if (change) {
    changeObject(change, object)
  }

  return assign({_deleted: true}, object)
}
