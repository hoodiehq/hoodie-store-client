module.exports = getState

var config = require('humble-localstorage')

var constants = require('./constants')

function getState () {
  return {
    id: config.getItem(constants.CONFIG_KEY_HOODIE_ID)
  }
}
