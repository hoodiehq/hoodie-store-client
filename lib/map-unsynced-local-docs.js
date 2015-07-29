module.exports = mapUnsyncedLocalDocs

function mapUnsyncedLocalDocs (options) {
  return this.unsyncedLocalDocs.call(this, options)

  .then(function (changedDocs) {
    return changedDocs.map(function (doc) {
      doc.id = doc._id
      delete doc._id

      return doc
    })
  })
}
