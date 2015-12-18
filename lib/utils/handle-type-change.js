module.exports = handleTypeChange

function handleTypeChange (state, emitter, type, eventName, object) {
  var stateIndex = state.storeObjectIds.indexOf(object.id)

  if (object.type === type) {
    emitter.emit(eventName + ':' + type, object)
    emitter.emit('change:' + type, eventName, object)

    if (stateIndex === -1) {
      state.storeObjectIds.push(object.id)
      emitter.emit('add:' + type, object)
    }
  } else {
    if (stateIndex > -1) {
      state.storeObjectIds.splice(stateIndex, 1)
      emitter.emit('remove:' + type, {id: object.id, type: type})
    }
  }
}
