module.exports = findAll

var typeFilter = require('../utils/type-filter')

function findAll (type, api, filterFunction) {
  return api.findAll(typeFilter.bind(null, type))

  .then(function (scopedObjects) {
    return filterFunction ? scopedObjects.filter(filterFunction) : scopedObjects
  })
}
