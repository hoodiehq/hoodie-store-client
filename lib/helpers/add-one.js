module.exports = addOne

var clone = require('lodash/clone')
var PouchDBErrors = require('pouchdb-errors')
var Promise = require('lie')
var uuid = require('pouchdb-utils').uuid
var validate = require('../validate')

var internals = addOne.internals = {}
internals.addTimestamps = require('../utils/add-timestamps')
internals.put = require('./db-put')

function addOne (state, doc, prefix) {
  if (typeof doc !== 'object') {
    return Promise.reject(PouchDBErrors.NOT_AN_OBJECT)
  }

  doc = clone(doc)

  if (!doc._id) {
    doc._id = uuid()
  }

  if (prefix) {
    doc._id = prefix + doc._id
  }

  delete doc.hoodie

  return validate(state, doc)

  .then(function () {
    return internals.put(state, internals.addTimestamps(doc))
  })
  .catch(function (error) {
    if (error.status === 409) {
      var conflict = new Error('Object with id "' + doc._id + '" already exists')
      conflict.name = 'Conflict'
      conflict.status = 409
      throw conflict
    } else {
      throw error
    }
  })
}
