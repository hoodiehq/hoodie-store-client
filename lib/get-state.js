/* global location */
module.exports = getState

var config = require('humble-localstorage')
var EventEmitter = require('events').EventEmitter

var constants = require('./constants')

function getState (options) {
  var url = options && options.url ? options.url : getCurrentOrigin()
  return {
    id: config.getItem(constants.CONFIG_KEY_HOODIE_ID),
    emitter: options && options.emitter || new EventEmitter(),
    url: url
  }
}

function getCurrentOrigin () {
  return typeof location !== 'undefined' ? location.origin : undefined
}
