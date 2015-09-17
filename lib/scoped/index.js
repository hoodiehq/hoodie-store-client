module.exports = scoped

var EventEmitter = require('events').EventEmitter

function scoped (api, type) {
  var emitter = new EventEmitter()

  var scopedApi = {
    add: require('./add').bind(null, type, api),
    find: require('./find').bind(null, type, api),
    findOrAdd: require('./find-or-add').bind(null, type, api),
    findAll: require('./find-all').bind(null, type, api),
    update: require('./update').bind(null, type, api),
    updateOrAdd: require('./update-or-add').bind(null, type, api),
    updateAll: require('./update-all').bind(null, type, api),
    remove: require('./remove').bind(null, type, api),
    removeAll: require('./remove-all').bind(null, type, api),
    on: function (eventName, handler) {
      emitter.on(eventName + ':' + type, handler)

      return scopedApi
    },
    one: function (eventName, handler) {
      emitter.once(eventName + ':' + type, handler)

      return scopedApi
    },
    off: function (eventName, handler) {
      emitter.removeListener(eventName + ':' + type, handler)

      return scopedApi
    }
  }

  api.on('change', require('../utils/handle-type-change').bind(null, emitter, type))

  return scopedApi
}

