'use strict'

/* istanbul ignore next */
var PouchDB = process.browser ? global.PouchDB : require('pouchdb')
var API = require('pouchdb-hoodie-api')
var Sync = require('pouchdb-hoodie-sync')
var merge = require('lodash.merge')
var EventEmitter = require('events').EventEmitter

PouchDB.plugin({
  hoodieApi: API.hoodieApi,
  hoodieSync: Sync.hoodieSync
})

module.exports = Store

function Store (dbName, options) {
  if (!(this instanceof Store)) return new Store(dbName, options)
  if (typeof dbName !== 'string') throw new Error('Must be a valid string.')
  options = options || {}

  var CustomPouchDB = PouchDB.defaults(options)
  var db = new CustomPouchDB(dbName)
  var emitter = new EventEmitter()
  var api = merge(db.hoodieSync({remote: dbName + '-remote', emitter: emitter}), db.hoodieApi({emitter: emitter}))

  return api
}

