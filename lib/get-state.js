module.exports = getState

var config = require('humble-localstorage')

var constants = require('./constants')

var EventEmitter = require('events').EventEmitter

function getState (options) {
  var url = options && options.url ? options.url : window.location.origin
  return {
    id: config.getItem(constants.CONFIG_KEY_HOODIE_ID),
    emitter: options && options.emitter || new EventEmitter(),
    url: url
  }
}
