module.exports = handleTypeChange

var clone = require('lodash/cloneDeep')

function handleTypeChange (state, emitter, type, eventName, object) {
  var wasScopeType = state.objectTypeById[object.id] === type
  var isScopeType = object.type === type
  var scopedEventName

  if (!wasScopeType && !isScopeType) {
    return
  }

  if (wasScopeType && !isScopeType) {
    object = clone(object)
    object.type = type
    scopedEventName = 'remove'
  } else if (!wasScopeType && isScopeType) {
    state.objectTypeById[object.id] = type
    scopedEventName = 'add'
  } else {
    scopedEventName = 'update'
  }

  emitter.emit(type + ':' + scopedEventName, object)
  emitter.emit(type + ':change', scopedEventName, object)
}
