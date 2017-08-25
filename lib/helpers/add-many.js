var clone = require('lodash/clone')
var uuid = require('pouchdb-utils').uuid
var validate = require('../validate')

var addTimestamps = require('../utils/add-timestamps')
var bulkDocs = require('./db-bulk-docs')

module.exports = function addMany (state, docs, prefix) {
  docs = docs.map(function (doc) {
    doc = clone(doc)
    delete doc.hoodie
    return addTimestamps(doc)
  })

  if (prefix) {
    docs.forEach(function (doc) {
      doc._id = prefix + (doc._id || uuid())
    })
  }

  var validationPromises = docs.map(function (doc) {
    return validate(state, doc)
  })

  return Promise.all(validationPromises)

  .then(function () {
    return bulkDocs(state, docs)
  })
  .catch(function (error) {
    throw error
  })
}
