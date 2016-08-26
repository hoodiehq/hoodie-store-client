module.exports = find

var typeFilter = require('../utils/type-filter')

function find (type, api, objectsOrIds) {
  return api.find(objectsOrIds)

  .then(function (storedObjects) {
    if (Array.isArray(storedObjects)) {
      return storedObjects.map(function (storedObject) {
        return (storedObject instanceof Error || typeFilter(type, storedObject))
          ? storedObject
          : handleIncorrectTypeError(type, storedObject)
      })
    } else {
      if (storedObjects.type === type) {
        return storedObjects
      } else {
        throw handleIncorrectTypeError(type, storedObjects)
      }
    }
  })
}

function handleIncorrectTypeError (type, storedObject) {
  var errorMessage = 'Object with type "' + type + '" and id "' + storedObject.id + '" is missing'
  var incorrectType = new Error(errorMessage)
  incorrectType.name = 'Not found'
  incorrectType.status = 404
  return incorrectType
}
