module.exports = isPersistent

var internals = module.exports.internals = {}
internals.humbleLocalStorage = require('humble-localstorage')

function isPersistent () {
  return internals.humbleLocalStorage.isPersistent
}
