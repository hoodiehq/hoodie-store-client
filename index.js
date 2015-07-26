'use strict'

var PouchDB = global.PouchDB || require('pouchdb')
var API = require('pouchdb-hoodie-api')
var Sync = require('pouchdb-hoodie-sync')
var UnsyncedLocalDocs = require('pouchdb-hoodie-unsynced-local-docs')
var merge = require('lodash.merge')
var EventEmitter = require('events').EventEmitter
var localStorageWrapper = require('humble-localstorage')

PouchDB.plugin({
  hoodieApi: API.hoodieApi,
  hoodieSync: Sync.hoodieSync,
  unsyncedLocalDocs: UnsyncedLocalDocs.unsyncedLocalDocs
})

module.exports = Store

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
      findAllUnsynced: mapUnsyncedLocalIds.bind(db),
      hasLocalChanges: hasLocalChanges.bind(db)
    }
  )
  subscribeToInternalEvents(emitter)

  return api
}

function mapUnsyncedLocalIds (options) {
  return this.unsyncedLocalDocs.call(this, options)

  .then(function (changedDocs) {
    return changedDocs.map(function (doc) {
      doc.id = doc._id
      delete doc._id

      return doc
    })
  })
}

function hasLocalChanges (objOrId) {
  var changedIds = localStorageWrapper.getObject('hoodie_changedObjectIds') || []
  if (objOrId) {
    var id = objOrId.id ? objOrId.id : objOrId
    return changedIds.indexOf(id) >= 0
  }

  return changedIds.length > 0
}

function markAsChanged (object) {
  var changedIds = localStorageWrapper.getObject('hoodie_changedObjectIds') || []
  var id = object.id
  var hasId = changedIds.indexOf(id) >= 0

  if (hasId) {
    return
  }
  localStorageWrapper.setObject('hoodie_changedObjectIds', changedIds.concat(id))
}

function unmarkAsChanged (object) {
  var changedIds = localStorageWrapper.getObject('hoodie_changedObjectIds')
  var id = object._id
  var index = changedIds.indexOf(id)

  if (index === -1) {
    return
  }

  changedIds.splice(index, 1)
  localStorageWrapper.setObject('hoodie_changedObjectIds', changedIds)
}

function subscribeToInternalEvents (emitter) {
  emitter.on('change', function (eventName, object) {
    markAsChanged(object)
  })

  emitter.on('push', function (object) {
    unmarkAsChanged(object)
  })

  emitter.on('clear', function () {
    localStorageWrapper.removeItem('hoodie_changedObjectIds')
  })
}
