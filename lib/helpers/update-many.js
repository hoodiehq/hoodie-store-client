var assign = require('lodash/assign')
var PouchDBErrors = require('pouchdb-errors')

var addTimestamps = require('../utils/add-timestamps')
var bulkDocs = require('./db-bulk-docs')
var changeObject = require('../utils/change-object')
var toId = require('../utils/to-id')

var findMany = require('./find-many')

module.exports = function updateMany (state, array, change, prefix) {
  var docs
  var ids = array.map(function (doc) {
    var id = toId(doc)

    if (prefix && id.substr(0, prefix.length) !== prefix) {
      id = prefix + id
    }

    return id
  })

  return findMany(state, array, prefix)

  .then(function (docs) {
    if (change) {
      return Promise.all(docs.map(function (doc) {
        if (doc instanceof Error) {
          return doc
        }

        return changeObject(state, change, doc)
      }))
    }

    return docs.map(function (doc, index) {
      var passedDoc = array[index]
      if (doc instanceof Error) {
        return doc
      }
      if (typeof passedDoc !== 'object') {
        return PouchDBErrors.NOT_AN_OBJECT
      }
      return assign(doc, passedDoc, {_id: doc._id, _rev: doc._rev, hoodie: doc.hoodie})
    })
  })

  .then(function (_docs) {
    docs = _docs
    var validObjects = docs.filter(function (doc) {
      return !(doc instanceof Error)
    })
    validObjects.forEach(addTimestamps)
    return bulkDocs(state, validObjects)
  })

  .then(function (updatedDocs) {
    updatedDocs.forEach(function (doc) {
      var index = ids.indexOf(doc._id)
      docs[index] = doc
    })

    return docs
  })
}
