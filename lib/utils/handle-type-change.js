module.exports = handleTypeChange

function handleTypeChange (emitter, type, eventName, object) {
  if (object.type === type) {
    emitter.emit(eventName + ':' + type, object)
    emitter.emit('change:' + type, eventName, object)
  }
}

