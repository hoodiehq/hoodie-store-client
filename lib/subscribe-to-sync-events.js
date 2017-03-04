module.exports = subscribeToSyncEvents

function subscribeToSyncEvents (syncApi, emmiter) {
  syncApi.on('push', emitHoodieObject.bind(emmiter, 'push'))
  syncApi.on('pull', emitHoodieObject.bind(emmiter, 'pull'))
  syncApi.on('connect', emitHoodieObject.bind(emmiter, 'connect'))
  syncApi.on('disconnect', emitHoodieObject.bind(emmiter, 'disconnect'))
}

function emitHoodieObject (event, doc) {
  if (doc) {
    this.emit(event, doc)
  } else {
    this.emit(event)
  }
}
