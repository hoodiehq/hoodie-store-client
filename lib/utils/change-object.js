var assign = require('lodash/assign')
var validate = require('../validate')

/**
  * change object either by passing changed properties
  * as an object, or by passing a change function that
  * manipulates the passed object directly
  **/
module.exports = function changeObject (state, change, object, validateChange) {
  var updatedObject = assign({}, object)

  if (typeof change === 'object') {
    updatedObject = assign(object, change)
  } else {
    change(updatedObject)
  }

  if (validateChange === false) {
    // for scenarios which do not need validation (mark-as-deleted)
    assign(object, updatedObject)

    return object
  } else {
    return validate(state, updatedObject)

    .then(function () {
      return updatedObject
    })

    .catch(function () {
      return object
    })
  }
}
