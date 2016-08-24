module.exports = updateOrAdd

var update = require('./update')
var add = require('./add')
var toId = require('pouchdb-hoodie-api/utils/to-id')

function updateOrAdd (type, api, idOrObjectOrArray, newObject) {
  return update(type, api, idOrObjectOrArray, newObject)

  .then(function (updatedItemsOrErrors) {
    if (!Array.isArray(updatedItemsOrErrors)) {
      // if this is not an array, then errors will be caught in .catch() below
      return updatedItemsOrErrors
    }

    // if this is an array, we need to iterate over all items to
    // ensure that none are errors
    return Promise.all(updatedItemsOrErrors.map(function (updatedItemOrError, index) {
      if (isNotFoundError(updatedItemOrError)) {
        return add(type, api, idOrObjectOrArray[index])
      }

      return Promise.resolve(updatedItemOrError)
    }))
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

function isNotFoundError (obj) {
  return obj instanceof Error && obj.name === 'Not found'
}
