module.exports = getState

var config = require('humble-localstorage')
var EventEmitter = require('events').EventEmitter

var defaultsDeep = require('lodash/defaultsDeep')

var constants = require('./constants')

function getState (options) {
  options = options || {}

  if (typeof options.url !== 'string') {
    throw new Error('"url" option is not defined')
  }

  var requiredProperties = {
    id: config.getItem(constants.CONFIG_KEY_HOODIE_ID),
    emitter: options && options.emitter || new EventEmitter()
  }

  return defaultsDeep(requiredProperties, options)
}
