module.exports = updateOrAdd

var update = require('./update')
var add = require('./add')
var toId = require('pouchdb-hoodie-api/utils/to-id')

function updateOrAdd (type, api, idOrObjectOrArray, newObject) {
  return update(type, api, idOrObjectOrArray, newObject)

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
