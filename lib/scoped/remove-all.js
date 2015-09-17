module.exports = removeAll

var findAll = require('./find-all')
var remove = require('./remove')

function removeAll (type, api, filterFunction) {
  return findAll(type, api)

  .then(function (scopedObjects) {
    return filterFunction ? remove(type, api, scopedObjects.filter(filterFunction)) : remove(type, api, scopedObjects)
  })
}
