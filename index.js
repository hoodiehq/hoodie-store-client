'use strict'

var PouchDB = require('pouchdb')
PouchDB.plugin(require('pouchdb-hoodie-api'))

module.exports = Store

function Store (dbName, options) {
  if (!(this instanceof Store)) return new Store(dbName)
  if (typeof dbName !== 'string') throw new Error('Must be a valid string.')
  options = options || {}

  this.db = new PouchDB(dbName, options)

  return this.db.hoodieApi()
}

