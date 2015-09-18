module.exports = {
  id: id,
  set: set,
  unset: unset
}

var config = require('humble-localstorage')

var constants = require('./constants')
var generateId = require('./utils/generate-id')

function id (state) {
  if (!state.id) {
    set(state, generateId())
  }
  return state.id
}

function set (state, newId) {
  state.id = newId
  config.setItem(constants.CONFIG_KEY_HOODIE_ID, state.id)
}

function unset (state) {
  set(state, undefined)
}
