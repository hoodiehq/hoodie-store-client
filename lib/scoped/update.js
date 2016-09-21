module.exports = update

var find = require('./find')
var merge = require('lodash/merge')

var checkType = require('../utils/check-scoped-type')

function update (type, api, objectsOrIds, change) {
  if (checkType.isTypeError(objectsOrIds, type) || checkType.isTypeError(change, type)) {
    return Promise.reject(new TypeError(checkType.createErrorMessage(type)))
  }

  return find(type, api, objectsOrIds)

  .then(function (storedObjects) {
    // objectsOrIds may contain updated information for the respective storedObject
    // (e.g. _deleted = true), so incorporate all information in the objectOrId into
    // the storedObject
    var updatedObjects = updateObjectsAndFilterErrors(objectsOrIds, storedObjects)

    return api.update(updatedObjects, change)

    .then(function (apiUpdates) {
      if (!Array.isArray(apiUpdates)) {
        return apiUpdates
      }

      return restoreOriginalFindErrors(storedObjects, apiUpdates)
    })
  })
}

function updateObjectsAndFilterErrors (objectsOrIds, storedObjects) {
  if (!Array.isArray(objectsOrIds)) {
    return updateObject(objectsOrIds, storedObjects)
  }

  return storedObjects.map(function (storedObject, index) {
    if (storedObject instanceof Error) {
      return storedObject
    }

    return updateObject(objectsOrIds[index], storedObject)
  }).filter(function (storedObject) {
    return !(storedObject instanceof Error)
  })
}

function updateObject (objectOrId, storedObject) {
  if (typeof objectOrId !== 'object') {
    return storedObject
  }

  return merge(storedObject, objectOrId)
}

function restoreOriginalFindErrors (foundObjects, apiUpdates) {
  return foundObjects.map(function (foundObject) {
    if (foundObject instanceof Error) {
      return foundObject
    }

    return apiUpdates.shift()
  })
}
