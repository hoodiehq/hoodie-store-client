module.exports = Store

var EventEmitter = require('events').EventEmitter

var merge = require('lodash/merge')

var subscribeToSyncEvents = require('./lib/subscribe-to-sync-events')
var syncWrapper = require('./lib/sync-wrapper')
var scoped = require('./lib/scoped/')
var isPersistent = require('./lib/is-persistent')

function Store (dbName, options) {
  if (!(this instanceof Store)) return new Store(dbName, options)
  if (typeof dbName !== 'string') throw new Error('Must be a valid string.')

  if (!options || (!options.remote && !options.remoteBaseUrl)) {
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
  var remote = options.remote
  var syncApi = db.hoodieSync({remote: remote})
  var storeApi = db.hoodieApi({emitter: emitter})

  var state = {
    objectTypeById: {},
    scopedApis: {},
    db: db
  }

  // possible race condition...
  storeApi.findAll().then(function (objects) {
    objects.forEach(function (object) {
      state.objectTypeById[object.id] = object.type
    })
  })

  var api = merge(
    scoped.bind(null, state, storeApi),
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
      off: storeApi.off
    },
    {
      push: syncWrapper.bind(syncApi, 'push'),
      pull: syncWrapper.bind(syncApi, 'pull'),
      sync: syncWrapper.bind(syncApi, 'sync'),
      connect: syncApi.connect,
      disconnect: syncApi.disconnect,
      isConnected: syncApi.isConnected,
      isPersistent: isPersistent.bind(null, state)
    }
  )

  api.reset = require('./lib/reset').bind(null, dbName, options.PouchDB, state, api, storeApi.clear, emitter, options.remoteBaseUrl, remote)

  subscribeToSyncEvents(syncApi, emitter)

  return api
}

Store.defaults = function (defaultOpts) {
  function CustomStore (dbName, options) {
    if (typeof dbName !== 'string') throw new Error('Must be a valid string.')
    options = options || {}

    options = merge({}, defaultOpts, options)

    return Store(dbName, options)
  }

  return CustomStore
}
