module.exports = Store

var EventEmitter = require('events').EventEmitter

var assign = require('lodash/assign')

var internals = Store.internals = {}
internals.handleChanges = require('./lib/helpers/handle-changes')

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

  var db = new options.PouchDB(dbName)
  var emitter = new EventEmitter()

  var state = {
    db: db,
    dbName: dbName,
    PouchDB: options.PouchDB,
    emitter: emitter,
    validate: options.validate,
    get remote () {
      return options.remote
    }
  }

  var api = {
    db: state.db,
    isPersistent: require('./lib/is-persistent').bind(null, state),
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
    pull: require('./lib/pull').bind(null, state),
    push: require('./lib/push').bind(null, state),
    sync: require('./lib/sync').bind(null, state),
    connect: require('./lib/connect').bind(null, state),
    disconnect: require('./lib/disconnect').bind(null, state),
    isConnected: require('./lib/is-connected').bind(null, state),
    reset: require('./lib/reset').bind(null, state)
  }

  state.api = api

  internals.handleChanges(state)

  return api
}

Store.defaults = function (defaultOpts) {
  function CustomStore (dbName, options) {
    if (typeof dbName !== 'string') throw new Error('Must be a valid string.')
    options = options || {}

    options = assign({}, defaultOpts, options)

    return new Store(dbName, options)
  }

  return CustomStore
}
