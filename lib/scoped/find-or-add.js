module.exports = findOrAdd

var toId = require('pouchdb-hoodie-api/utils/to-id')
var find = require('./find')
var add = require('./add')

function findOrAdd (type, api, idOrObjectOrArray, newObject) {
  return find(type, api, idOrObjectOrArray)

  .then(function (typedObjects) {
    if (Array.isArray(idOrObjectOrArray)) {
      var objectIds = typedObjects.map(toId)

      var notFoundObjects = idOrObjectOrArray.reduce(function (notFoundObjects, typedObject) {
        if (objectIds.indexOf(typedObject.id) === -1) {
          notFoundObjects.push(typedObject)
        }

        return notFoundObjects
      }, [])

      return add(type, api, notFoundObjects)

      .then(function (addedObjects) {
        var passedObjectIds = idOrObjectOrArray.map(toId)
        var objects = []

        typedObjects.concat(addedObjects).forEach(function (object) {
          var index = passedObjectIds.indexOf(object.id)
          objects[index] = object
        })

        return objects
      })
    } else {
      return typedObjects
    }
  })

  .catch(function () {
    if (Array.isArray(idOrObjectOrArray)) {
      newObject = idOrObjectOrArray
    } else {
      var id = toId(idOrObjectOrArray)

      if (!id) {
        throw new Error('Missing ID')
      }

      if (idOrObjectOrArray === id && !newObject) {
        throw new Error('Missing ID')
      }

      if (typeof newObject === 'object') {
        newObject.id = id
      } else {
        newObject = idOrObjectOrArray
      }
    }

    return add(type, api, newObject)
  })
}
