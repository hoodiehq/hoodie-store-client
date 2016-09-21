module.exports = remove

var update = require('./update')
var markAsDeleted = require('pouchdb-hoodie-api/utils/mark-as-deleted')
var checkType = require('../utils/check-scoped-type')

function remove (type, api, objectsOrIds, change) {
  if (checkType.isTypeError(objectsOrIds, type) || checkType.isTypeError(change, type)) {
    return Promise.reject(new TypeError(checkType.createErrorMessage(type)))
  }

  return Array.isArray(objectsOrIds)
  ? update(type, api, objectsOrIds.map(markAsDeleted.bind(null, change)))
  : update(type, api, objectsOrIds, markAsDeleted(change, objectsOrIds))
}
