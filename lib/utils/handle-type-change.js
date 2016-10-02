module.exports = handleTypeChange

var clone = require('lodash/cloneDeep')

function handleTypeChange (state, emitter, type, eventName, object) {
  var wasScopeType = state.objectTypeById[object.id] === type
  var isScopeType = object.type === type
  var scopedEventName

  if (!wasScopeType && !isScopeType) {
    return
  }

  if (objectWasDeleted(object) || objectMovedScope(wasScopeType, isScopeType)) {
    object = clone(object)
    object.type = type
    scopedEventName = 'remove'

    if (objectWasDeleted(object)) {
      delete state.objectTypeById[object.id]
    } else {
      state.objectTypeById[object.id] = type
    }
  } else if (!wasScopeType && isScopeType) {
    state.objectTypeById[object.id] = type
    scopedEventName = 'add'
  } else {
    scopedEventName = 'update'
  }

  emitter.emit(type + ':' + scopedEventName, object)
  emitter.emit(type + ':change', scopedEventName, object)
}

function objectWasDeleted (object) {
  return object._deleted
}

function objectMovedScope (wasScopeType, isScopeType) {
  return wasScopeType && !isScopeType
}
