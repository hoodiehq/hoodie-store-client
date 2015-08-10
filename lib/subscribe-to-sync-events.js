module.exports = subscribeToSyncEvents

var toObject = require('./utils/to-object')

function subscribeToSyncEvents (syncApi, emmiter) {
  syncApi.on('push', emitHoodieObject.bind(emmiter, 'push'))
  syncApi.on('pull', emitHoodieObject.bind(emmiter, 'pull'))
  syncApi.on('connect', emitHoodieObject.bind(emmiter, 'connect'))
  syncApi.on('disconnect', emitHoodieObject.bind(emmiter, 'disconnect'))
}

function emitHoodieObject (event, object) {
  if (object) {
    this.emit(event, toObject(object))
  } else {
    this.emit(event)
  }
}
