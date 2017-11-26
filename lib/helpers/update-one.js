var assign = require('lodash/assign')
var PouchDBErrors = require('pouchdb-errors')
var Promise = require('lie')

var changeObject = require('../utils/change-object')
var addTimestamps = require('../utils/add-timestamps')

var findOne = require('./find-one')
var put = require('./db-put')

module.exports = function updateOne (state, idOrDoc, change, prefix) {
  var doc

  if (typeof idOrDoc === 'string' && !change) {
    return Promise.reject(PouchDBErrors.NOT_AN_OBJECT)
  }

  return findOne(state, idOrDoc, prefix)

  .then(function (doc) {
    if (!change) {
      return assign(doc, idOrDoc, {_id: doc._id, _rev: doc._rev, hoodie: doc.hoodie})
    }

    return changeObject(state, change, doc)
  })

  .then(function (_doc) {
    doc = _doc
    return put(state, addTimestamps(doc))
  })
}
