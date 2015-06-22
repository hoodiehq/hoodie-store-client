'use strict'

var PouchDB = require('pouchdb')

module.exports = Store

function Store (dbName) {
  if (!(this instanceof Store)) return new Store(dbName)
  if (typeof dbName !== 'string') throw new Error('Must be a valid string.')

  this.db = new PouchDB(dbName)
}
