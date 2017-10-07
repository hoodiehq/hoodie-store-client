var assign = require('lodash/assign')
var changeObject = require('./change-object')

// Normalizes objectOrId, applies changes if any, and mark as deleted
module.exports = function markAsDeleted (state, change, objectOrId) {
  var object = typeof objectOrId === 'string' ? { _id: objectOrId } : objectOrId

  if (change) {
    changeObject(state, change, object, false)
  }

  return assign({_deleted: true}, object)
}
