module.exports = Store

var PouchDB = global.PouchDB || require('pouchdb')
var API = require('pouchdb-hoodie-api')
var Sync = require('pouchdb-hoodie-sync')
var UnsyncedLocalDocs = require('pouchdb-hoodie-unsynced-local-docs')
var merge = require('lodash.merge')
var EventEmitter = require('events').EventEmitter

var hasLocalChanges = require('./lib/has-local-changes')
var mapUnsyncedLocalDocs = require('./lib/map-unsynced-local-docs')
var subscribeToInternalEvents = require('./lib/subscribe-to-internal-events')

PouchDB.plugin({
  hoodieApi: API.hoodieApi,
  hoodieSync: Sync.hoodieSync,
  unsyncedLocalDocs: UnsyncedLocalDocs.unsyncedLocalDocs
})

function Store (dbName, options) {
  if (!(this instanceof Store)) return new Store(dbName, options)
  if (typeof dbName !== 'string') throw new Error('Must be a valid string.')
  options = options || {}

  var CustomPouchDB = PouchDB.defaults(options)
  var db = new CustomPouchDB(dbName)
  var emitter = new EventEmitter()
  var remote = options.remote || dbName + '-remote'
  var api = merge(
    db.hoodieSync({remote: remote, emitter: emitter}),
    db.hoodieApi({emitter: emitter}),
    {
      findAllUnsynced: mapUnsyncedLocalDocs.bind(db),
      hasLocalChanges: hasLocalChanges.bind(db)
    }
  )
  subscribeToInternalEvents(emitter)

  return api
}

Store.defaults = function (defaultOpts) {
  function CustomStore (dbName, options) {
    if (typeof dbName !== 'string') throw new Error('Must be a valid string.')
    options = options || {}

    options = merge(defaultOpts, options)

    return Store(dbName, options)
  }

  return CustomStore
}
