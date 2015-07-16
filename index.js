'use strict'

/* istanbul ignore next */
var PouchDB = process.browser ? global.PouchDB : require('pouchdb')
var API = require('pouchdb-hoodie-api')
var Sync = require('pouchdb-hoodie-sync')
var UnsyncedLocalDocs = require('pouchdb-hoodie-unsynced-local-docs')
var merge = require('lodash.merge')
var EventEmitter = require('events').EventEmitter

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
  var api = merge(
    db.hoodieSync({remote: dbName + '-remote', emitter: emitter}),
    db.hoodieApi({emitter: emitter}),
    {
      unsyncedLocalDocs: mapUnsyncedLocalIds.bind(db, db.unsyncedLocalDocs)
    }
  )

  return api
}

function mapUnsyncedLocalIds (unsyncedLocalDocs, options) {
  return unsyncedLocalDocs.call(this, options)

  .then(function (changedDocs) {
    return changedDocs.map(function (doc) {
      doc.id = doc._id
      delete doc._id

      return doc
    })
  })
}

