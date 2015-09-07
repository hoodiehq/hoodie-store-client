module.exports = subscribeToSyncEvents

var toObject = require('./utils/to-object')

function subscribeToSyncEvents (syncApi, emmiter) {
  syncApi.on('push', emitHoodieObject.bind(emmiter, 'push'))
  syncApi.on('pull', emitHoodieObject.bind(emmiter, 'pull'))
  syncApi.on('connect', emitHoodieObject.bind(emmiter, 'connect'))
  syncApi.on('disconnect', emitHoodieObject.bind(emmiter, 'disconnect'))
}

function emitHoodieObject (event, doc) {
  if (doc) {
    var object = toObject(doc)
    this.emit(event, object)

    if (event === 'pull') {
      var changeType = getChangeTypeFor(object)
      this.emit('change', changeType, object, {remote: true})
      this.emit(changeType, object, {remote: true})
    }
  } else {
    this.emit(event)
  }
}

function getChangeTypeFor (object) {
  if (object._deleted) {
    return 'remove'
  }

  if (object._rev.slice(0, 2) === '1-') {
    return 'add'
  }

  return 'update'
}
