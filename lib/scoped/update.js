module.exports = update

var find = require('./find')

function update (type, api, objectsOrIds, change) {
  return find(type, api, objectsOrIds)

  .then(function (storedObjects) {
    return api.update(objectsOrIds, change)
  })
}
