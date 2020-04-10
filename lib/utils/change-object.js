var assign = require('lodash/assign')
var validate = require('../validate')

/**
  * change object either by passing changed properties
  * as an object, or by passing a change function that
  * manipulates the passed object directly
  **/
module.exports = function changeObject (state, change, object) {
  var updatedObject = assign({}, object)

  if (typeof change === 'object') {
    updatedObject = assign(object, change)
  } else {
    change(updatedObject)
  }

  return validate(state, updatedObject)

  .then(function () {
    return updatedObject
  })
}
