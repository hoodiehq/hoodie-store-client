module.exports = remove

var update = require('./update')
var markAsDeleted = require('pouchdb-hoodie-api/utils/mark-as-deleted')

function remove (type, api, objectsOrIds, change) {
  return Array.isArray(objectsOrIds)
  ? update(type, api, objectsOrIds.map(markAsDeleted.bind(null, change)))
  : update(type, api, objectsOrIds, markAsDeleted(change, objectsOrIds))
}
