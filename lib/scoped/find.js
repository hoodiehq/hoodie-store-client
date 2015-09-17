module.exports = find

var typeFilter = require('../utils/type-filter')

function find (type, api, objectsOrIds) {
  return api.find(objectsOrIds)

  .then(function (storedObjects) {
    if (Array.isArray(storedObjects)) {
      var typedObjects = storedObjects.filter(typeFilter.bind(null, type))

      if (typedObjects.length === 0) {
        throw new Error('Items not found')
      } else {
        return typedObjects
      }
    } else {
      if (storedObjects.type === type) {
        return storedObjects
      } else {
        throw new Error('Item not found')
      }
    }
  })
}
