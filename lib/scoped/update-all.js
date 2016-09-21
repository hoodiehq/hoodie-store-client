module.exports = updateAll

var checkType = require('../utils/check-scoped-type')
var findAll = require('./find-all')
var update = require('./update')

function updateAll (type, api, changedProperties) {
  if (checkType.isTypeError(changedProperties, type)) {
    return Promise.reject(new TypeError(checkType.createErrorMessage(type)))
  }

  return findAll(type, api)

  .then(function (foundObjects) {
    return update(type, api, foundObjects, changedProperties)
  })
}
