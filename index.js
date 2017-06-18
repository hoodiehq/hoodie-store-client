module.exports = Store

var EventEmitter = require('events').EventEmitter

var merge = require('lodash/merge')

var isPersistent = require('./lib/is-persistent')
var startListenToChanges = require('./lib/helpers/start-listen-to-changes')
var subscribeToSyncEvents = require('./lib/subscribe-to-sync-events')

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
    .plugin(require('pouchdb-hoodie-sync'))

  var db = new options.PouchDB(dbName)
  var emitter = new EventEmitter()
  var syncApi = db.hoodieSync(options)

  var state = {
    db: db,
    emitter: emitter
  }

  state.emitter.once('newListener', startListenToChanges.bind(null, state))

  var api = merge(
    {
      db: state.db,
      add: require('./lib/add').bind(null, state, null),
      find: require('./lib/find').bind(null, state, null),
      findAll: require('./lib/find-all').bind(null, state, null),
      findOrAdd: require('./lib/find-or-add').bind(null, state, null),
      update: require('./lib/update').bind(null, state, null),
      updateOrAdd: require('./lib/update-or-add').bind(null, state, null),
      updateAll: require('./lib/update-all').bind(null, state, null),
      remove: require('./lib/remove').bind(null, state, null),
      removeAll: require('./lib/remove-all').bind(null, state, null),
      withIdPrefix: require('./lib/with-id-prefix').bind(null, state),
      on: require('./lib/on').bind(null, state),
      one: require('./lib/one').bind(null, state),
      off: require('./lib/off').bind(null, state),
      clear: require('./lib/clear').bind(null, state)
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

  api.reset = require('./lib/reset').bind(null, dbName, options, state, api, emitter)

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
