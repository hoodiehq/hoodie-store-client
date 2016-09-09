/* global location */
module.exports = getState

var config = require('humble-localstorage')
var EventEmitter = require('events').EventEmitter

var defaultsDeep = require('lodash/defaultsDeep')

var constants = require('./constants')

function getState (options) {
  options = options || {}
  var defaultOptions = {
    url: getCurrentOrigin()
  }

  var requiredProperties = {
    id: config.getItem(constants.CONFIG_KEY_HOODIE_ID),
    emitter: options && options.emitter || new EventEmitter()
  }

  return defaultsDeep(requiredProperties, options, defaultOptions)
}

function getCurrentOrigin () {
  return typeof location !== 'undefined' ? location.origin : undefined
}
