module.exports = Store

var EventEmitter = require('events').EventEmitter

var merge = require('lodash/merge')

var subscribeToSyncEvents = require('./lib/subscribe-to-sync-events')
var isPersistent = require('./lib/is-persistent')

function Store (dbName, options) {
  if (!(this instanceof Store)) return new Store(dbName, options)
  if (typeof dbName !== 'string') throw new Error('Must be a valid string.')

  if (!options || (!('remote' in options) && !options.remoteBaseUrl)) {
    throw new Error('options.remote or options.remoteBaseUrl is required')
  }

  if (options.remoteBaseUrl) {
    options.remoteBaseUrl = options.remoteBaseUrl.replace(/\/$/, '')
    if (!options.remote) {
      options.remote = dbName
    }
    if (!/^https?:\/\//.test(options.remote)) {
      options.remote = (options.remoteBaseUrl + '/' + encodeURIComponent(options.remote))
    }
  }

  // plugins are directly applied to `options.PouchDB`
  options.PouchDB
    .plugin(require('pouchdb-hoodie-api'))
    .plugin(require('pouchdb-hoodie-sync'))

  var db = new options.PouchDB(dbName)
  var emitter = new EventEmitter()
  var syncApi = db.hoodieSync(options)
  var storeApi = db.hoodieApi({emitter: emitter})

  var state = {
    objectTypeById: {},
    db: db
  }

  // possible race condition...
  storeApi.findAll().then(function (objects) {
    objects.forEach(function (object) {
      state.objectTypeById[object.id] = object.type
    })
  })

  var api = merge(
    {
      db: storeApi.db,
      add: storeApi.add,
      find: storeApi.find,
      findAll: storeApi.findAll,
      findOrAdd: storeApi.findOrAdd,
      update: storeApi.update,
      updateOrAdd: storeApi.updateOrAdd,
      updateAll: storeApi.updateAll,
      remove: storeApi.remove,
      removeAll: storeApi.removeAll,
      on: storeApi.on,
      one: storeApi.one,
      off: storeApi.off,
      withIdPrefix: storeApi.withIdPrefix
    },
    {
      push: syncApi.push,
      pull: syncApi.pull,
      sync: syncApi.sync,
      connect: syncApi.connect,
      disconnect: syncApi.disconnect,
      isConnected: syncApi.isConnected,
      isPersistent: isPersistent.bind(null, state)
    }
  )

  api.reset = require('./lib/reset').bind(null, dbName, options, state, api, storeApi.clear, emitter)

  subscribeToSyncEvents(syncApi, emitter)

  return api
}

Store.defaults = function (defaultOpts) {
  function CustomStore (dbName, options) {
    if (typeof dbName !== 'string') throw new Error('Must be a valid string.')
    options = options || {}

    options = merge({}, defaultOpts, options)

    return new Store(dbName, options)
  }

  return CustomStore
}
