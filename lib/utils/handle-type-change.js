module.exports = handleTypeChange

function handleTypeChange (state, emitter, type, eventName, object) {
  var wasScopeType = state.objectTypeById[object.id] === type
  var isScopeType = object.type === type

  if (wasScopeType && !isScopeType) {
    emitter.emit('remove:' + type, {id: object.id, type: type})
  }
  if (!wasScopeType && isScopeType) {
    state.objectTypeById[object.id] = type
    emitter.emit('add:' + type, object)
  }
  if (isScopeType || wasScopeType) {
    emitter.emit(eventName + ':' + type, object)
    emitter.emit('change:' + type, eventName, object)
  }
}
