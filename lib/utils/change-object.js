var assign = require('lodash/assign')

/**
  * change object either by passing changed properties
  * as an object, or by passing a change function that
  * manipulates the passed object directly
  **/
module.exports = function changeObject (change, object) {
  if (typeof change === 'object') {
    return assign(object, change)
  }

  change(object)
  return object
}
