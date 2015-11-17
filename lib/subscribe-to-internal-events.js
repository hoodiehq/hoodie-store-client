module.exports = subscribeToInternalEvents

var localStorageWrapper = require('humble-localstorage')

function subscribeToInternalEvents (emitter) {
  emitter.on('change', function (eventName, object, options) {
    if (options && options.remote) {
      unmarkAsChanged(object)
    } else {
      markAsChanged(object)
    }
  })

  emitter.on('push', function (object) {
    unmarkAsChanged(object)
  })

  emitter.on('clear', function () {
    localStorageWrapper.removeItem('hoodie_changedObjectIds')
  })
}

function markAsChanged (object) {
  var changedIds = localStorageWrapper.getObject('hoodie_changedObjectIds') || []
  var id = object.id
  var hasId = changedIds.indexOf(id) >= 0

  if (hasId) {
    return
  }
  localStorageWrapper.setObject('hoodie_changedObjectIds', changedIds.concat(id))
}

function unmarkAsChanged (object) {
  var changedIds = localStorageWrapper.getObject('hoodie_changedObjectIds')
  if (!Array.isArray(changedIds)) {
    return
  }

  var id = object.id
  var index = changedIds.indexOf(id)

  if (index === -1) {
    return
  }

  changedIds.splice(index, 1)
  localStorageWrapper.setObject('hoodie_changedObjectIds', changedIds)
}
