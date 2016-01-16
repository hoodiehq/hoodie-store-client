module.exports = toObject

var merge = require('lodash/merge')

function toObject (object) {
  object = merge({
    id: object._id
  }, object)

  delete object._id

  return object
}
