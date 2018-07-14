module.exports = prefixEventHandler

function prefixEventHandler (prefix, prefixState) {
  prefixState.parentEmitter.on('change', function (eventName, object) {
    if (object._id.substr(0, prefix.length) !== prefix) {
      return
    }

    prefixState.emitter.emit('change', eventName, object)
    prefixState.emitter.emit(eventName, object)
  })
}
